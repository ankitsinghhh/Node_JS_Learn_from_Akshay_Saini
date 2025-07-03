// const cron = require("node-cron");
// const ConnectionRequestModel = require("../models/connectionRequest");
// const {subDays, startOfDay, endOfDay} = require('date-fns');
// const sendEmail = require("./sendEmail");

// cron.schedule("0 8 * * *", async () => {
//   ///seding emails to all people who got requests the previous day, it will be sent every day at 8:00 am
//   try {
//     const yesterday = subDays(new Date(), 1);

//     const yesterdayStart = startOfDay(yesterday);
//     const yesterdayEnd = endOfDay(yesterday);


//     const pendingRequests = await ConnectionRequestModel.find({
//       status: "interested",
//       createdAt: {
//         $gte: yesterdayStart,
//         $lte: yesterdayEnd
//       }
//       }).populate("fromUserId toUserId");

//       const listOfEmails = [...new Set(pendingRequests.map((request) => request.toUserId.email))]

//       console.log(listOfEmails.length);
//       console.log(listOfEmails);

//       for(const email of listOfEmails) {
//            try {
//               const res = await sendEmail.run(
//                 "New Request Pending",
//                 "There are pending friend request pending, please login to Devtinde and acccept or reject the request"
//               );
//               console.log(res);
//            } catch (error) {
//               console.log(error)
//            }
//       }


//   } catch (err) {
//     console.log(err);
//   }
// });
