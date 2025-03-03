import ScreenHeaderBtn from "./common/header/ScreenHeaderBtn";
// Remove both Welcome and Nearbyjobs imports since they don't exist
import Popularjobs from "./home/popular/Popularjobs";
import JobsList from "./home/jobslist/JobsList";
import Company from "./jobdetails/company/Company";
import { default as JobTabs } from "./jobdetails/tabs/Tabs";
import { default as JobAbout } from "./jobdetails/about/About";
import { default as JobFooter } from "./jobdetails/footer/Footer";
import Specifics from "./jobdetails/specifics/Specifics";
import NearbyJobCard from "./common/cards/nearby/NearbyJobCard";

export {
  ScreenHeaderBtn,
  // Welcome removed
  // Nearbyjobs removed
  Popularjobs,
  JobsList,
  Company,
  JobTabs,
  JobAbout,
  JobFooter,
  Specifics,
  NearbyJobCard,
};
