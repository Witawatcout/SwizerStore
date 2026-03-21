export default defineEventHandler(async (event) => {
  // ฝั่ง server ไม่ต้องทำอะไรเป็นพิเศษ เพราะ token อยู่ฝั่ง client (localStorage/Pinia)
  // ถ้าต้องการทำ token blacklist ในอนาคต สามารถเพิ่มได้ที่นี่
  // เช่น: เพิ่ม token เข้า blacklist table ใน DB หรือ Redis
  return { success: true, message: "Logged out successfully" };
});
