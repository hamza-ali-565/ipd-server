import moment from "moment-timezone";

export const getCreatedOn = () => {
  return moment(new Date()).tz("Asia/Karachi").format("DD/MM/YYYY HH:mm:ss");
};

// Usage
console.log(getCreatedOn()); // This will give you the current date and time in the specified format
