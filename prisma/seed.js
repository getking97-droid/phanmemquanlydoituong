// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")

  // 1. Clean existing data
  console.log("Cleaning up database...")
  await prisma.caseSuspect.deleteMany({})
  await prisma.case.deleteMany({})
  await prisma.suspect.deleteMany({})
  await prisma.user.deleteMany({})

  // 2. Create Users
  console.log("Creating users...")
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash("admin123", salt)
  const hashedOfficerPassword = await bcrypt.hash("officer123", salt)

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Trưởng phòng Cảnh sát Hình sự",
      password: hashedPassword,
      role: "ADMIN"
    }
  })

  const officer = await prisma.user.create({
    data: {
      email: "officer@example.com",
      name: "Điều tra viên Nguyễn Văn Nghiệp",
      password: hashedOfficerPassword,
      role: "OFFICER"
    }
  })

  console.log(`Created users: ${admin.email}, ${officer.email}`)

  // 3. Create Suspects
  console.log("Creating suspects...")
  const suspects = [
    {
      fullName: "Nguyễn Văn Nam",
      aliases: "Nam Con",
      dateOfBirth: new Date("1990-05-14"),
      idNumber: "037090012345",
      address: "12 Hùng Vương, Lộc Thọ, Nha Trang, Khánh Hòa",
      bloodType: "A",
      height: 170.0,
      weight: 65.0,
      features: "Sẹo dài 3cm chạy dọc má trái",
      status: "WANTED",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      fullName: "Trần Thị Lan",
      aliases: "Lan Vy",
      dateOfBirth: new Date("1993-11-22"),
      idNumber: "037193005678",
      address: "45 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa",
      bloodType: "O",
      height: 158.0,
      weight: 48.0,
      features: "Nốt ruồi to dưới đuôi mắt phải",
      status: "IN_PRISON",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    },
    {
      fullName: "Lê Hoàng Hải",
      aliases: "Hải Bánh Nha Trang",
      dateOfBirth: new Date("1985-08-01"),
      idNumber: "037085002233",
      address: "78 Nguyễn Trãi, Phước Tân, Nha Trang, Khánh Hòa",
      bloodType: "B",
      height: 175.0,
      weight: 78.0,
      features: "Hình xăm rồng quấn quanh bắp tay phải",
      status: "RELEASED",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    {
      fullName: "Phạm Minh Tuấn",
      aliases: "Tuấn Cao",
      dateOfBirth: new Date("1995-02-28"),
      idNumber: "037195009988",
      address: "102 Đường 2/4, Vĩnh Phước, Nha Trang, Khánh Hòa",
      bloodType: "AB",
      height: 182.0,
      weight: 72.0,
      features: "Cụt nửa đốt ngón tay út bàn tay trái",
      status: "UNKNOWN",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    {
      fullName: "Đặng Quốc Bảo",
      aliases: "Bảo Bột",
      dateOfBirth: new Date("1992-06-12"),
      idNumber: "037092003344",
      address: "15 Thái Nguyên, Phước Tân, Nha Trang, Khánh Hòa",
      bloodType: "O",
      height: 168.0,
      weight: 60.0,
      features: "Sẹo tròn đường kính 1cm ở giữa trán",
      status: "WANTED",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
    }
  ]

  const createdSuspects = []
  for (const s of suspects) {
    const suspect = await prisma.suspect.create({ data: s })
    createdSuspects.push(suspect)
  }
  console.log(`Created ${createdSuspects.length} suspects.`)

  // 4. Create Cases
  console.log("Creating cases...")
  const cases = [
    {
      caseNumber: "VA-2026-001",
      title: "Trộm cắp tài sản quy mô lớn tại Tiệm vàng Kim Chung",
      description: "Đối tượng lợi dụng đêm tối đột nhập từ tầng thượng tiệm vàng Kim Chung, vô hiệu hóa camera an ninh và lấy đi số lượng lớn trang sức trị giá khoảng 500 triệu đồng.",
      date: new Date("2026-01-10"),
      location: "12 Hùng Vương, Lộc Thọ, Nha Trang, Khánh Hòa",
      status: "OPEN"
    },
    {
      caseNumber: "VA-2026-002",
      title: "Tổ chức sử dụng trái phép chất ma túy tại Karaoke Luxury",
      description: "Lực lượng PC02 phối hợp kiểm tra hành chính, bắt quả tang nhóm đối tượng đang bay lắc sử dụng ma túy tổng hợp thuốc lắc và ketamine tại phòng VIP 302.",
      date: new Date("2026-03-05"),
      location: "45 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa",
      status: "CLOSED"
    },
    {
      caseNumber: "VA-2026-003",
      title: "Cố ý gây thương tích dẫn đến chết người tại Bờ kè Hà Ra",
      description: "Xảy ra mâu thuẫn cự cãi trong lúc nhậu nhẹt bia rượu tại quán ốc bờ kè, đối tượng đã rút dao găm đâm nhiều nhát khiến nạn nhân tử vong tại chỗ rồi bỏ trốn khỏi hiện trường.",
      date: new Date("2026-05-18"),
      location: "Bờ kè Hà Ra, Vĩnh Phước, Nha Trang, Khánh Hòa",
      status: "OPEN"
    }
  ]

  const createdCases = []
  for (const c of cases) {
    const kase = await prisma.case.create({ data: c })
    createdCases.push(kase)
  }
  console.log(`Created ${createdCases.length} cases.`)

  // 5. Connect Suspects to Cases
  console.log("Connecting suspects to cases...")
  // Case 1 (Kim Chung gold theft): Nam Con (Main Suspect), Hải Bánh (Accomplice)
  await prisma.caseSuspect.create({
    data: {
      caseId: createdCases[0].id,
      suspectId: createdSuspects[0].id,
      role: "MAIN_SUSPECT"
    }
  })
  await prisma.caseSuspect.create({
    data: {
      caseId: createdCases[0].id,
      suspectId: createdSuspects[2].id,
      role: "ACCOMPLICE"
    }
  })

  // Case 2 (Karaoke Luxury drug): Lan Vy (Main Suspect), Tuấn Cao (Witness)
  await prisma.caseSuspect.create({
    data: {
      caseId: createdCases[1].id,
      suspectId: createdSuspects[1].id,
      role: "MAIN_SUSPECT"
    }
  })
  await prisma.caseSuspect.create({
    data: {
      caseId: createdCases[1].id,
      suspectId: createdSuspects[3].id,
      role: "WITNESS"
    }
  })

  // Case 3 (Bờ kè murder): Bảo Bột (Main Suspect)
  await prisma.caseSuspect.create({
    data: {
      caseId: createdCases[2].id,
      suspectId: createdSuspects[4].id,
      role: "MAIN_SUSPECT"
    }
  })

  console.log("Database seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
