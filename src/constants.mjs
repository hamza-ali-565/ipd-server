import moment from "moment-timezone";

export const getCreatedOn = () => {
  return moment(new Date()).tz("Asia/Karachi").format("DD/MM/YYYY HH:mm:ss");
};
export const getCreatedOnDate = () => {
  return moment(new Date()).tz("Asia/Karachi").format("DD/MM/YYYY");
};

// Usage
console.log(getCreatedOnDate()); // This will give you the current date and time in the specified format
