import React, { useState, useEffect } from "react";
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
  Linking,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Calendar } from "react-native-calendars";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { FontAwesome } from "@expo/vector-icons";

const Session = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [schedulingModal, setSchedulingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState([]);
  const [bookingsModalVisible, setBookingsModalVisible] = useState(false);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);

  useEffect(() => {
    fetchCounselors();
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

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
      Alert.alert(
        "Error",
        "Failed to load counselors. Please try again later."
      );
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    if (!user) return;

    setUserBookingsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().meetings) {
        const meetings = userDoc.data().meetings;
        meetings.sort((a, b) => {
          const dateA = a.date.toDate();
          const dateB = b.date.toDate();
          return dateB - dateA;
        });

        setUserBookings(meetings);
      } else {
        setUserBookings([]);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      Alert.alert("Error", "Failed to load your bookings.");
    } finally {
      setUserBookingsLoading(false);
    }
  };

  const handleCounselorSelect = (counselor) => {
    setSelectedCounselor(counselor);
    setModalVisible(true);
  };

  const handleScheduleMeeting = () => {
    setModalVisible(false);
    setSchedulingModal(true);

    setSelectedDate("");
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (selectedCounselor) {
      generateMarkedDates(selectedCounselor);
    }
  };

  const generateMarkedDates = async (counselor) => {
    try {
      const marks = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formatDateString = (date) => {
        return date.toISOString().split("T")[0];
      };

      const hasAvailableSlots = (dateInfo, bookedSlots) => {
        if (!dateInfo.slots || dateInfo.slots.length === 0) return false;

        const bookedTimesForDate = bookedSlots
          .filter((slot) => {
            if (!slot.date || typeof slot.date.toDate !== "function")
              return false;
            const bookedDate = slot.date.toDate();
            const dateToCheck = dateInfo.date.toDate();
            return (
              formatDateString(bookedDate) === formatDateString(dateToCheck)
            );
          })
          .map((slot) => slot.time);

        return dateInfo.slots.some(
          (slot) => !bookedTimesForDate.includes(slot)
        );
      };

      // Helper function to determine booking status (red, orange, or green)
      const getDotColor = (availableSlots, bookedSlots) => {
        if (!availableSlots || availableSlots.length === 0) return "red";

        // Calculate actual availability percentage based on booked slots
        const totalSlots = availableSlots.length;
        const bookedCount = bookedSlots.length;
        const availableCount = totalSlots - bookedCount;
        const availabilityPercentage = (availableCount / totalSlots) * 100;

        if (availabilityPercentage === 0) return "red";
        if (availabilityPercentage <= 50) return "orange";
        return "green";
      };

      if (counselor.availableDates && counselor.availableDates.length > 0) {
        counselor.availableDates.forEach((dateInfo) => {
          try {
            if (dateInfo.date && typeof dateInfo.date.toDate === "function") {
              const date = dateInfo.date.toDate();
              if (date >= today) {
                const dateString = formatDateString(date);

                // Get all slots available for this date
                const availableSlots = Array.isArray(dateInfo.slots)
                  ? dateInfo.slots
                  : [];

                // Get booked slots for this date
                const bookedTimesForDate = (counselor.bookedSlots || [])
                  .filter((slot) => {
                    if (!slot.date || typeof slot.date.toDate !== "function")
                      return false;
                    const bookedDate = slot.date.toDate();
                    return formatDateString(bookedDate) === dateString;
                  })
                  .map((slot) => slot.time);

                // Filter to get only the slots that are actually booked
                const actuallyBookedSlots = bookedTimesForDate.filter((time) =>
                  availableSlots.includes(time)
                );

                const isFullyBooked =
                  availableSlots.length > 0 &&
                  actuallyBookedSlots.length === availableSlots.length;

                const dotColor = getDotColor(
                  availableSlots,
                  actuallyBookedSlots
                );

                marks[dateString] = {
                  marked: true,
                  dotColor: dotColor,
                  disabled: isFullyBooked,
                };
              }
            }
          } catch (e) {
            console.error("Error processing date:", e);
          }
        });
      } else {
        const nextThirtyDays = new Date();
        nextThirtyDays.setDate(today.getDate() + 30);

        for (
          let date = new Date(today);
          date <= nextThirtyDays;
          date.setDate(date.getDate() + 1)
        ) {
          const dayName = date
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase();
          const dayAvailability = counselor.availability?.find(
            (avail) => avail.day === dayName
          );

          if (
            dayAvailability &&
            dayAvailability.slots &&
            dayAvailability.slots.length > 0
          ) {
            const dateStr = formatDateString(date);
            const totalSlots = [...dayAvailability.slots];

            const bookedSlotsForThisDay = (counselor.bookedSlots || [])
              .filter((slot) => {
                if (!slot.date || typeof slot.date.toDate !== "function")
                  return false;
                const bookedDateStr = formatDateString(slot.date.toDate());
                return bookedDateStr === dateStr;
              })
              .map((slot) => slot.time);

            // Filter to get only the slots that are actually booked from available slots
            const actuallyBookedSlots = bookedSlotsForThisDay.filter((time) =>
              totalSlots.includes(time)
            );

            const allSlotsBooked =
              totalSlots.length > 0 &&
              actuallyBookedSlots.length === totalSlots.length;

            const dotColor = getDotColor(totalSlots, actuallyBookedSlots);

            marks[dateStr] = {
              marked: true,
              dotColor: dotColor,
              disabled: allSlotsBooked,
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

      const newMarkedDates = { ...markedDates };

      Object.keys(newMarkedDates).forEach((date) => {
        if (newMarkedDates[date].selected) {
          newMarkedDates[date] = {
            ...newMarkedDates[date],
            selected: false,
          };
        }
      });

      newMarkedDates[selectedDateStr] = {
        ...newMarkedDates[selectedDateStr],
        selected: true,
        selectedColor: COLORS.primary,
      };

      setMarkedDates(newMarkedDates);

      if (selectedCounselor) {
        await fetchAvailableSlots(selectedCounselor.id, selectedDateStr);
      }
    } catch (error) {
      console.error("Error in handleDateSelect:", error);
      Alert.alert(
        "Error",
        "Failed to load date information. Please try again."
      );
    }
  };

  const fetchAvailableSlots = async (counselorId, dateStr) => {
    try {
      setAvailableSlots([]);
      const selectedDateObj = new Date(dateStr);
      const dayName = selectedDateObj
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      const formatDateForComparison = (date) => {
        if (!date) return "";
        if (typeof date === "string") return date.split("T")[0];

        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      let isDateAvailable = false;
      let availableTimeSlotsForDate = [];

      if (selectedCounselor.availableDates) {
        const matchingDate = selectedCounselor.availableDates.find(
          (dateInfo) => {
            if (!dateInfo.date || typeof dateInfo.date.toDate !== "function")
              return false;

            const availableDateStr = formatDateForComparison(
              dateInfo.date.toDate()
            );
            return availableDateStr === dateStr;
          }
        );

        if (matchingDate) {
          isDateAvailable = true;
          if (matchingDate.slots && Array.isArray(matchingDate.slots)) {
            availableTimeSlotsForDate = Array.isArray(matchingDate.slots)
              ? matchingDate.slots.map((s) =>
                  typeof s === "string" ? s : s.time
                )
              : [];
          }
        }
      }

      if (!isDateAvailable || availableTimeSlotsForDate.length === 0) {
        const dayAvailability = selectedCounselor.availability.find(
          (avail) => avail.day === dayName
        );

        if (dayAvailability && dayAvailability.slots) {
          availableTimeSlotsForDate = [...dayAvailability.slots];
        }
      }

      if (
        selectedCounselor.bookedSlots &&
        selectedCounselor.bookedSlots.length > 0
      ) {
        const bookedTimesForDate = selectedCounselor.bookedSlots
          .filter((slot) => {
            if (!slot.date || typeof slot.date.toDate !== "function")
              return false;

            const bookedDateStr = formatDateForComparison(slot.date.toDate());
            return bookedDateStr === dateStr;
          })
          .map((slot) => slot.time);

        availableTimeSlotsForDate = availableTimeSlotsForDate.filter(
          (time) => !bookedTimesForDate.includes(time)
        );
      }

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

      const userRef = doc(db, "users", user.uid);

      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        try {
          await updateDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            createdAt: Timestamp.now(),
            meetings: [],
          });
        } catch (error) {
          const userSetData = {
            email: user.email,
            displayName: user.displayName,
            createdAt: Timestamp.now(),
            meetings: [],
          };
          await setDoc(userRef, userSetData);
        }
      }

      const meetingData = {
        counselorId: selectedCounselor.id,
        counselorName: selectedCounselor.name,
        counselorImage: selectedCounselor.photoURL || "",
        date: Timestamp.fromDate(new Date(selectedDate)),
        time: selectedSlot,
        meetLink: googleMeetLink,
        status: "confirmed",
      };

      await updateDoc(userRef, {
        meetings: arrayUnion(meetingData),
      });

      const counselorRef = doc(db, "counselors", selectedCounselor.id);
      await updateDoc(counselorRef, {
        bookedSlots: arrayUnion({
          userId: user.uid,
          userName: user.displayName || user.email,
          date: Timestamp.fromDate(new Date(selectedDate)),
          time: selectedSlot,
          meetLink: googleMeetLink,
          status: "confirmed",
        }),
      });

      setConfirmationLoading(false);
      setSchedulingModal(false);

      const updatedCounselors = counselors.map((c) => {
        if (c.id === selectedCounselor.id) {
          const bookedSlots = c.bookedSlots || [];
          return {
            ...c,
            bookedSlots: [
              ...bookedSlots,
              {
                userId: user.uid,
                userName: user.displayName || user.email,
                date: Timestamp.fromDate(new Date(selectedDate)),
                time: selectedSlot,
                meetLink: googleMeetLink,
                status: "confirmed",
              },
            ],
          };
        }
        return c;
      });

      setCounselors(updatedCounselors);
      fetchUserBookings();

      Alert.alert(
        "Booking Confirmed",
        `Your session with ${
          selectedCounselor.name
        } has been confirmed for ${new Date(
          selectedDate
        ).toLocaleDateString()} at ${selectedSlot}.\n\nYou can join the meeting at the scheduled time via Google Meet.`,
        [
          { text: "OK" },
          { text: "Add to Calendar", onPress: () => addToCalendar() },
          {
            text: "View Bookings",
            onPress: () => setBookingsModalVisible(true),
          },
        ]
      );
    } catch (error) {
      console.error("Error booking session:", error);
      setConfirmationLoading(false);

      if (error.code === "permission-denied") {
        Alert.alert(
          "Permission Error",
          "You don't have permission to book this session. Please contact support."
        );
      } else {
        Alert.alert(
          "Booking Error",
          "Failed to book the session. Please try again later."
        );
      }
    }
  };

  const addToCalendar = () => {
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedSlot.split(":");
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + 1);

    const eventTitle = `Counseling Session with ${selectedCounselor.name}`;
    const details = `Virtual counseling session with ${selectedCounselor.name}`;

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle
    )}&details=${encodeURIComponent(details)}&dates=${startDateTime
      .toISOString()
      .replace(/-|:|\.\d+/g, "")}/${endDateTime
      .toISOString()
      .replace(/-|:|\.\d+/g, "")}`;

    Linking.openURL(calendarUrl);
  };

  const handleOpenGoogleMeet = (meetLink) => {
    Linking.openURL(meetLink).catch(() => {
      Alert.alert(
        "Error",
        "Unable to open Google Meet. Please check the link."
      );
    });
  };

  const renderCounselorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCounselorSelect(item)}
    >
      <Image
        source={{ uri: item.photoURL || "https://via.placeholder.com/150" }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.specialization}</Text>
        <Text style={styles.cardDetail} numberOfLines={2}>
          {item.experience} years experience
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating || "4.5"}</Text>
          <Text style={styles.sessions}>
            {item.sessionCount || "100"}+ sessions
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item, index }) => {
    const sessionDate = item.date.toDate();
    const isUpcoming = sessionDate > new Date();
    const formattedDate = sessionDate.toLocaleDateString();

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingTitle}>{item.counselorName}</Text>
            <Text style={styles.bookingDateTime}>
              {formattedDate} at {item.time}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isUpcoming ? styles.upcomingBadge : styles.pastBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {isUpcoming ? "Upcoming" : "Past"}
            </Text>
          </View>
        </View>

        {isUpcoming && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleOpenGoogleMeet(item.meetLink)}
          >
            <Text style={styles.joinButtonText}>Join Meeting</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Professional Counselors</Text>
        <Text style={styles.subheading}>
          Book a one-on-one session with expert counselors
        </Text>

        <TouchableOpacity
          style={styles.bookingsButton}
          onPress={() => {
            fetchUserBookings();
            setBookingsModalVisible(true);
          }}
        >
          <FontAwesome name="calendar" size={16} color="#fff" />
          <Text style={styles.bookingsButtonText}>My Bookings</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={counselors}
        renderItem={renderCounselorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

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
              <FontAwesome name="close" size={20} color="#555" />
            </TouchableOpacity>

            {selectedCounselor && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{
                    uri:
                      selectedCounselor.photoURL ||
                      "https://via.placeholder.com/300",
                  }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <Text style={styles.modalName}>{selectedCounselor.name}</Text>
                <Text style={styles.modalSpecialization}>
                  {selectedCounselor.specialization}
                </Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Experience:</Text>
                  <Text style={styles.detailValue}>
                    {selectedCounselor.experience} years
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rating:</Text>
                  <Text style={styles.detailValue}>
                    ⭐ {selectedCounselor.rating || "4.5"}/5
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Languages:</Text>
                  <Text style={styles.detailValue}>
                    {selectedCounselor.languages?.join(", ") || "English"}
                  </Text>
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
                  <Text style={styles.scheduleButtonText}>
                    Schedule Meeting
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
              <FontAwesome name="close" size={20} color="#555" />
            </TouchableOpacity>

            <Text style={styles.schedulingTitle}>Schedule Your Meeting</Text>
            {selectedCounselor && (
              <View style={styles.counselorBrief}>
                <Image
                  source={{
                    uri:
                      selectedCounselor.photoURL ||
                      "https://via.placeholder.com/100",
                  }}
                  style={styles.smallImage}
                />
                <View>
                  <Text style={styles.counselorName}>
                    {selectedCounselor.name}
                  </Text>
                  <Text style={styles.counselorSpec}>
                    {selectedCounselor.specialization}
                  </Text>
                </View>
              </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.calendarLabel}>Select a date:</Text>

              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "green" }]}
                  />
                  <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "orange" }]}
                  />
                  <Text style={styles.legendText}>Partially booked</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "red" }]}
                  />
                  <Text style={styles.legendText}>Fully booked</Text>
                </View>
              </View>

              <Calendar
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                minDate={new Date().toISOString().split("T")[0]}
                maxDate={
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
                theme={{
                  todayTextColor: COLORS.primary,
                  arrowColor: COLORS.primary,
                  dotColor: COLORS.primary,
                  selectedDotColor: "#ffffff",
                }}
              />

              {selectedDate && (
                <>
                  <Text style={styles.timeSlotLabel}>
                    Available time slots:
                  </Text>
                  {availableSlots.length > 0 ? (
                    <View style={styles.slotsContainer}>
                      {availableSlots.map((slot, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.timeSlot,
                            selectedSlot === slot && styles.selectedTimeSlot,
                          ]}
                          onPress={() => handleSlotSelect(slot)}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              selectedSlot === slot &&
                                styles.selectedTimeSlotText,
                            ]}
                          >
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noSlotsText}>
                      No available slots for this date
                    </Text>
                  )}
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!selectedDate || !selectedSlot) && styles.disabledButton,
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={bookingsModalVisible}
        onRequestClose={() => setBookingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setBookingsModalVisible(false)}
            >
              <FontAwesome name="close" size={20} color="#555" />
            </TouchableOpacity>

            <Text style={styles.schedulingTitle}>My Bookings</Text>

            {userBookingsLoading ? (
              <View style={styles.centeredContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading your bookings...</Text>
              </View>
            ) : userBookings.length > 0 ? (
              <FlatList
                data={userBookings}
                renderItem={renderBookingItem}
                keyExtractor={(item, index) => `booking-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bookingsList}
              />
            ) : (
              <View style={styles.centeredContent}>
                <Text style={styles.noBookingsText}>
                  You don't have any bookings yet.
                </Text>
                <TouchableOpacity
                  style={styles.scheduleNowButton}
                  onPress={() => setBookingsModalVisible(false)}
                >
                  <Text style={styles.scheduleNowText}>Schedule Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  headerContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 5,
  },
  subheading: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 10,
  },
  bookingsButton: {
    position: "absolute",
    right: 20,
    top: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  bookingsButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,

    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 2,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffb700",
    marginRight: 8,
  },
  sessions: {
    fontSize: 12,
    color: "#777777",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFC",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 30,
    maxHeight: "90%",
    ...SHADOWS.large,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 6,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  modalName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  modalSpecialization: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  detailLabel: {
    width: 100,
    fontSize: 15,
    color: "#777777",
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
    fontWeight: "600",
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#e8e8e8",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tag: {
    backgroundColor: "#eef1fb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  scheduleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  schedulingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  counselorBrief: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  smallImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  counselorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  counselorSpec: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  calendarLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  calendarLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#555555",
    fontWeight: "500",
  },
  timeSlotLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginTop: 20,
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f7f9ff",
    borderRadius: 25,
    margin: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  timeSlotText: {
    fontSize: 14,
    color: "#555555",
    fontWeight: "500",
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedTimeSlotText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  noSlotsText: {
    textAlign: "center",
    color: "#777777",
    marginTop: 15,
    fontStyle: "italic",
    fontSize: 15,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: COLORS.gray2,
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  bookingTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  bookingDateTime: {
    fontSize: 15,
    color: "#555555",
    marginTop: 2,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginLeft: 6,
  },
  upcomingBadge: {
    backgroundColor: "#e6fffa",
  },
  pastBadge: {
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    ...SHADOWS.small,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noBookingsText: {
    fontSize: 17,
    color: "#777777",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  scheduleNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    position: "absolute",
    ...SHADOWS.small,
  },
  scheduleNowText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  bookingsList: {
    paddingTop: 10,
    paddingBottom: 20,
  },
});

export default Session;
