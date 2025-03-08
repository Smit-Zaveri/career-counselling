import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
    Linking
} from 'react-native';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, Timestamp, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Calendar } from 'react-native-calendars';

const Session = () => {
    const [counselors, setCounselors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCounselor, setSelectedCounselor] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [schedulingModal, setSchedulingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [confirmationLoading, setConfirmationLoading] = useState(false);
    const [markedDates, setMarkedDates] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        fetchCounselors();
    }, []);

    const fetchCounselors = async () => {
        try {
            const counselorsRef = collection(db, "counselors");
            const querySnapshot = await getDocs(counselorsRef);
            const counselorsList = [];
            
            querySnapshot.forEach((doc) => {
                counselorsList.push({ id: doc.id, ...doc.data() });
            });
            
            setCounselors(counselorsList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching counselors:", error);
            Alert.alert("Error", "Failed to load counselors. Please try again later.");
            setLoading(false);
        }
    };

    const handleCounselorSelect = (counselor) => {
        setSelectedCounselor(counselor);
        setModalVisible(true);
    };

    const handleScheduleMeeting = () => {
        setModalVisible(false);
        setSchedulingModal(true);
        
        // Reset selected date and slot
        setSelectedDate('');
        setSelectedSlot(null);
        setAvailableSlots([]);
        
        // Generate available dates for highlighting in calendar
        if (selectedCounselor) {
            generateMarkedDates(selectedCounselor);
        }
    };

    // Generate marked dates for calendar highlighting
    const generateMarkedDates = async (counselor) => {
        try {
            const marks = {};
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Helper function to format date to YYYY-MM-DD
            const formatDateString = (date) => {
                return date.toISOString().split('T')[0];
            };
            
            // Helper function to check if a date has available slots
            const hasAvailableSlots = (dateInfo, bookedSlots) => {
                if (!dateInfo.slots || dateInfo.slots.length === 0) return false;
                
                const bookedTimesForDate = bookedSlots
                    .filter(slot => {
                        if (!slot.date || typeof slot.date.toDate !== 'function') return false;
                        const bookedDate = slot.date.toDate();
                        const dateToCheck = dateInfo.date.toDate();
                        return formatDateString(bookedDate) === formatDateString(dateToCheck);
                    })
                    .map(slot => slot.time);
                
                return dateInfo.slots.some(slot => !bookedTimesForDate.includes(slot));
            };

            // Check for availableDates array
            if (counselor.availableDates && counselor.availableDates.length > 0) {
                counselor.availableDates.forEach(dateInfo => {
                    try {
                        if (dateInfo.date && typeof dateInfo.date.toDate === 'function') {
                            const date = dateInfo.date.toDate();
                            if (date >= today) {
                                const dateString = formatDateString(date);
                                const isFullyBooked = !hasAvailableSlots(dateInfo, counselor.bookedSlots || []);
                                
                                marks[dateString] = {
                                    marked: true,
                                    dotColor: isFullyBooked ? 'red' : 'green',
                                    disabled: isFullyBooked
                                };
                            }
                        }
                    } catch (e) {
                        console.error("Error processing date:", e);
                    }
                });
            } else {
                // Fallback to using availability configuration
                const nextThirtyDays = new Date();
                nextThirtyDays.setDate(today.getDate() + 30);
                
                for (let date = new Date(today); date <= nextThirtyDays; date.setDate(date.getDate() + 1)) {
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    const dayAvailability = counselor.availability.find(avail => avail.day === dayName);
                    
                    if (dayAvailability && dayAvailability.slots.length > 0) {
                        // Check if all slots for this day are booked
                        const dateStr = formatDateString(date);
                        const bookedSlotsForThisDay = (counselor.bookedSlots || [])
                            .filter(slot => {
                                if (!slot.date || typeof slot.date.toDate !== 'function') return false;
                                return formatDateString(slot.date.toDate()) === dateStr;
                            })
                            .map(slot => slot.time);
                        
                        const allSlotsBooked = dayAvailability.slots.every(time => bookedSlotsForThisDay.includes(time));
                        
                        marks[dateStr] = {
                            marked: true,
                            dotColor: allSlotsBooked ? 'red' : 'green',
                            disabled: allSlotsBooked
                        };
                    }
                }
            }
            
            setMarkedDates(marks);
            
        } catch (error) {
            console.error("Error generating marked dates:", error);
            setMarkedDates({});
            Alert.alert("Error", "Failed to load available dates.");
        }
    };

    const handleDateSelect = async (day) => {
        try {
            const selectedDateStr = day.dateString;
            setSelectedDate(selectedDateStr);
            
            // Update selected date in marked dates
            const newMarkedDates = { ...markedDates };
            
            // Remove previous selection
            Object.keys(newMarkedDates).forEach(date => {
                if (newMarkedDates[date].selected) {
                    newMarkedDates[date] = {
                        ...newMarkedDates[date],
                        selected: false
                    };
                }
            });
            
            // Add new selection
            newMarkedDates[selectedDateStr] = {
                ...newMarkedDates[selectedDateStr],
                selected: true,
                selectedColor: COLORS.primary
            };
            
            setMarkedDates(newMarkedDates);
            
            // Fetch available slots for the selected date
            if (selectedCounselor) {
                await fetchAvailableSlots(selectedCounselor.id, selectedDateStr);
            }
        } catch (error) {
            console.error("Error in handleDateSelect:", error);
            Alert.alert("Error", "Failed to load date information. Please try again.");
        }
    };
    
    // Fetch available slots from Firestore or counselor data
    const fetchAvailableSlots = async (counselorId, dateStr) => {
        try {
            setAvailableSlots([]);
            const selectedDateObj = new Date(dateStr);
            const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            
            // Helper function to format date to YYYY-MM-DD for comparison
            const formatDateForComparison = (date) => {
                if (!date) return '';
                if (typeof date === 'string') return date.split('T')[0];
                
                const d = new Date(date);
                return d.toISOString().split('T')[0];
            };
            
            // First check if the date exists in availableDates
            let isDateAvailable = false;
            let availableTimeSlotsForDate = [];
            
            if (selectedCounselor.availableDates) {
                const matchingDate = selectedCounselor.availableDates.find(dateInfo => {
                    if (!dateInfo.date || typeof dateInfo.date.toDate !== 'function') return false;
                    
                    const availableDateStr = formatDateForComparison(dateInfo.date.toDate());
                    return availableDateStr === dateStr;
                });

                if (matchingDate) {
                    isDateAvailable = true;
                    // If the matchingDate has explicit slots, use those
                    if (matchingDate.slots && Array.isArray(matchingDate.slots)) {
                        availableTimeSlotsForDate = Array.isArray(matchingDate.slots) ? 
                            matchingDate.slots.map(s => typeof s === 'string' ? s : s.time) : [];
                    }
                }
            }

            // If no specific date found or no slots specified, fallback to weekly availability
            if (!isDateAvailable || availableTimeSlotsForDate.length === 0) {
                const dayAvailability = selectedCounselor.availability.find(
                    avail => avail.day === dayName
                );

                if (dayAvailability && dayAvailability.slots) {
                    availableTimeSlotsForDate = [...dayAvailability.slots];
                }
            }

            console.log(`Available slots before filtering: ${availableTimeSlotsForDate.length}`);

            // Filter out booked slots for this date
            if (selectedCounselor.bookedSlots && selectedCounselor.bookedSlots.length > 0) {
                const bookedTimesForDate = selectedCounselor.bookedSlots
                    .filter(slot => {
                        if (!slot.date || typeof slot.date.toDate !== 'function') return false;
                        
                        const bookedDateStr = formatDateForComparison(slot.date.toDate());
                        return bookedDateStr === dateStr;
                    })
                    .map(slot => slot.time);

                console.log(`Found ${bookedTimesForDate.length} booked slots for date ${dateStr}`);

                // Remove booked slots from available slots
                availableTimeSlotsForDate = availableTimeSlotsForDate.filter(
                    time => !bookedTimesForDate.includes(time)
                );
            }

            console.log(`Available slots after filtering: ${availableTimeSlotsForDate.length}`);

            // Sort time slots chronologically
            availableTimeSlotsForDate.sort((a, b) => {
                const timeA = new Date(`1970/01/01 ${a}`);
                const timeB = new Date(`1970/01/01 ${b}`);
                return timeA - timeB;
            });

            setAvailableSlots(availableTimeSlotsForDate);
            
        } catch (error) {
            console.error("Error fetching available slots:", error);
            setAvailableSlots([]);
            Alert.alert("Error", "Failed to load available time slots.");
        }
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
    };

    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedSlot || !user || !selectedCounselor) {
            Alert.alert("Error", "Please select a date and time slot");
            return;
        }

        setConfirmationLoading(true);
        
        try {
            const meetingId = Math.random().toString(36).substring(2, 15);
            const googleMeetLink = `https://meet.google.com/${meetingId}`;
            
            // First update user's bookings since we have permission for that
            const userRef = doc(db, "users", user.uid);
            
            // Check if user document exists
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
                // Create user document if it doesn't exist
                try {
                    await updateDoc(userRef, {
                        email: user.email,
                        displayName: user.displayName,
                        createdAt: Timestamp.now(),
                        meetings: []
                    });
                } catch (error) {
                    // If update fails, try set instead for new document
                    const userSetData = {
                        email: user.email,
                        displayName: user.displayName,
                        createdAt: Timestamp.now(),
                        meetings: []
                    };
                    await setDoc(userRef, userSetData);
                }
            }
            
            // Update user with meeting
            await updateDoc(userRef, {
                meetings: arrayUnion({
                    counselorId: selectedCounselor.id,
                    counselorName: selectedCounselor.name,
                    date: Timestamp.fromDate(new Date(selectedDate)),
                    time: selectedSlot,
                    meetLink: googleMeetLink,
                    status: 'confirmed'
                })
            });

            // Now try to update counselor document with booking
            const counselorRef = doc(db, "counselors", selectedCounselor.id);
            await updateDoc(counselorRef, {
                bookedSlots: arrayUnion({
                    userId: user.uid,
                    userName: user.displayName || user.email,
                    date: Timestamp.fromDate(new Date(selectedDate)),
                    time: selectedSlot,
                    meetLink: googleMeetLink,
                    status: 'confirmed'
                })
            });
            
            setConfirmationLoading(false);
            setSchedulingModal(false);
            
            Alert.alert(
                "Booking Confirmed", 
                `Your session with ${selectedCounselor.name} has been confirmed for ${new Date(selectedDate).toLocaleDateString()} at ${selectedSlot}.\n\nYou can join the meeting at the scheduled time via Google Meet.`,
                [
                    { text: "OK" },
                    { text: "Add to Calendar", onPress: () => addToCalendar() }
                ]
            );
            
            // Refresh counselors list to show updated availability
            fetchCounselors();
            
        } catch (error) {
            console.error("Error booking session:", error);
            setConfirmationLoading(false);
            
            // More specific error messages
            if (error.code === 'permission-denied') {
                Alert.alert("Permission Error", "You don't have permission to book this session. Please contact support.");
            } else {
                Alert.alert("Booking Error", "Failed to book the session. Please try again later.");
            }
        }
    };
    
    const addToCalendar = () => {
        // Create calendar event URL for Google Calendar
        const startDateTime = new Date(selectedDate);
        const [hours, minutes] = selectedSlot.split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1);
        
        const eventTitle = `Counseling Session with ${selectedCounselor.name}`;
        const details = `Virtual counseling session with ${selectedCounselor.name}`;
        
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(details)}&dates=${startDateTime.toISOString().replace(/-|:|\.\d+/g, '')}/${endDateTime.toISOString().replace(/-|:|\.\d+/g, '')}`;
        
        Linking.openURL(calendarUrl);
    };

    const renderCounselorCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCounselorSelect(item)}
        >
            <Image 
                source={{ uri: item.photoURL || 'https://via.placeholder.com/150' }} 
                style={styles.cardImage} 
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.specialization}</Text>
                <Text style={styles.cardDetail} numberOfLines={2}>{item.experience} years experience</Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {item.rating || '4.5'}</Text>
                    <Text style={styles.sessions}>{item.sessionCount || '100'}+ sessions</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading counselors...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Professional Counselors</Text>
            <Text style={styles.subheading}>Book a one-on-one session with expert counselors</Text>
            
            <FlatList
                data={counselors}
                renderItem={renderCounselorCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Counselor Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        
                        {selectedCounselor && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Image 
                                    source={{ uri: selectedCounselor.photoURL || 'https://via.placeholder.com/300' }} 
                                    style={styles.modalImage} 
                                    resizeMode="cover"
                                />
                                <Text style={styles.modalName}>{selectedCounselor.name}</Text>
                                <Text style={styles.modalSpecialization}>{selectedCounselor.specialization}</Text>
                                
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Experience:</Text>
                                    <Text style={styles.detailValue}>{selectedCounselor.experience} years</Text>
                                </View>
                                
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Rating:</Text>
                                    <Text style={styles.detailValue}>⭐ {selectedCounselor.rating || '4.5'}/5</Text>
                                </View>
                                
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Languages:</Text>
                                    <Text style={styles.detailValue}>{selectedCounselor.languages?.join(', ') || 'English'}</Text>
                                </View>
                                
                                <View style={styles.horizontalLine} />
                                
                                <Text style={styles.sectionTitle}>About</Text>
                                <Text style={styles.aboutText}>{selectedCounselor.about}</Text>
                                
                                <Text style={styles.sectionTitle}>Expertise</Text>
                                <View style={styles.tagsContainer}>
                                    {selectedCounselor.expertise?.map((tag, index) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                                
                                <TouchableOpacity 
                                    style={styles.scheduleButton}
                                    onPress={handleScheduleMeeting}
                                >
                                    <Text style={styles.scheduleButtonText}>Schedule Meeting</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Scheduling Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={schedulingModal}
                onRequestClose={() => setSchedulingModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => setSchedulingModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.schedulingTitle}>Schedule Your Meeting</Text>
                        {selectedCounselor && (
                            <View style={styles.counselorBrief}>
                                <Image 
                                    source={{ uri: selectedCounselor.photoURL || 'https://via.placeholder.com/100' }} 
                                    style={styles.smallImage} 
                                />
                                <View>
                                    <Text style={styles.counselorName}>{selectedCounselor.name}</Text>
                                    <Text style={styles.counselorSpec}>{selectedCounselor.specialization}</Text>
                                </View>
                            </View>
                        )}
                        
                        <Text style={styles.calendarLabel}>Select a date:</Text>
                        
                        {/* Calendar Legend */}
                        <View style={styles.calendarLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
                                <Text style={styles.legendText}>Available</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: 'orange' }]} />
                                <Text style={styles.legendText}>Partially booked</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
                                <Text style={styles.legendText}>Fully booked</Text>
                            </View>
                        </View>
                        
                        <Calendar
                            onDayPress={handleDateSelect}
                            markedDates={markedDates}
                            minDate={new Date().toISOString().split('T')[0]}
                            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            theme={{
                                todayTextColor: COLORS.primary,
                                arrowColor: COLORS.primary,
                                dotColor: COLORS.primary,
                                selectedDotColor: '#ffffff',
                            }}
                        />
                        
                        {selectedDate && (
                            <>
                                <Text style={styles.timeSlotLabel}>Available time slots:</Text>
                                {availableSlots.length > 0 ? (
                                    <View style={styles.slotsContainer}>
                                        {availableSlots.map((slot, index) => (
                                            <TouchableOpacity 
                                                key={index}
                                                style={[
                                                    styles.timeSlot,
                                                    selectedSlot === slot && styles.selectedTimeSlot
                                                ]}
                                                onPress={() => handleSlotSelect(slot)}
                                            >
                                                <Text style={[
                                                    styles.timeSlotText,
                                                    selectedSlot === slot && styles.selectedTimeSlotText
                                                ]}>
                                                    {slot}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.noSlotsText}>No available slots for this date</Text>
                                )}
                            </>
                        )}
                        
                        <TouchableOpacity 
                            style={[
                                styles.confirmButton,
                                (!selectedDate || !selectedSlot) && styles.disabledButton
                            ]}
                            onPress={handleConfirmBooking}
                            disabled={!selectedDate || !selectedSlot || confirmationLoading}
                        >
                            {confirmationLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    // ...existing styles remain the same
    calendarLegend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        marginBottom: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        fontSize: 12,
        color: COLORS.gray,
    },
    
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 20,
        paddingHorizontal: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 10,
        marginBottom: 5,
    },
    subheading: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 20,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        ...SHADOWS.medium,
        padding: 10,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    cardContent: {
        flex: 1,
        paddingLeft: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.tertiary,
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.primary,
        marginBottom: 4,
    },
    cardDetail: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginRight: 10,
    },
    sessions: {
        fontSize: 12,
        color: COLORS.gray,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.primary,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 60,
        paddingTop: 20,
        maxHeight: '90%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    closeButtonText: {
        fontSize: 22,
        color: COLORS.gray,
    },
    modalImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 15,
    },
    modalName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.tertiary,
    },
    modalSpecialization: {
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        width: 100,
        fontSize: 14,
        color: COLORS.gray,
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: COLORS.tertiary,
        fontWeight: '500',
    },
    horizontalLine: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.tertiary,
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 14,
        color: COLORS.gray,
        lineHeight: 20,
        marginBottom: 15,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tag: {
        backgroundColor: '#e8f4f8',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: COLORS.primary,
    },
    scheduleButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    scheduleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    schedulingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.tertiary,
        marginBottom: 15,
        textAlign: 'center',
    },
    counselorBrief: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    smallImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    counselorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.tertiary,
    },
    counselorSpec: {
        fontSize: 14,
        color: COLORS.primary,
    },
    calendarLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.tertiary,
        marginBottom: 10,
    },
    timeSlotLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.tertiary,
        marginTop: 15,
        marginBottom: 10,
    },
    slotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeSlot: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        margin: 5,
    },
    timeSlotText: {
        fontSize: 13,
        color: COLORS.gray,
    },
    selectedTimeSlot: {
        backgroundColor: COLORS.primary,
    },
    selectedTimeSlotText: {
        color: '#fff',
    },
    noSlotsText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: 10,
        fontStyle: 'italic',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
});

export default Session;