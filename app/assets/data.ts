import Coffee from '@@/public/Products/Coffee.png'
import Grains from '@@/public/Products/Grains.png'
import Protein from '@@/public/Products/Protein.png'  

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null; // ถ้าเป็น null คือหมวดหมู่หลัก (Main Category)
}

// โครงสร้างหมวดหมู่แบบลำดับชั้น (Hierarchical Categories)
export const categories: Category[] = [
  // หมวดหมู่หลัก (Main Categories)
  { id: 'food', name: 'อาหาร', slug: 'food', parentId: null },
  { id: 'supplement', name: 'อาหารเสริม', slug: 'supplement', parentId: null },
  
  // หมวดหมู่ย่อย ระดับ 1 (Sub Categories)
  { id: 'protein', name: 'โปรตีน', slug: 'protein', parentId: 'food' },
  { id: 'beverage', name: 'เครื่องดื่ม', slug: 'beverage', parentId: 'food' },
  { id: 'grains', name: 'ธัญพืช', slug: 'grains', parentId: 'food' },

  // หมวดหมู่ย่อย ระดับ 2 (Sub-sub Categories - ถ้ามี)
  { id: 'whey-protein', name: 'เวย์โปรตีน', slug: 'whey-protein', parentId: 'protein' },
  { id: 'plant-protein', name: 'โปรตีนพืช', slug: 'plant-protein', parentId: 'protein' },
  { id: 'coffee', name: 'กาแฟ', slug: 'coffee', parentId: 'beverage' },
];

export const products = [
  {
    id: 'chia-seeds',
    categoryId: 'grains', // เชื่อมโยงไปยังหมวดหมู่
    name: 'สไวเซอร์ เนเชอรัล เจียซีด 100%',
    description: 'เมล็ดเจีย เป็นธัญพืชมหัศจรรย์ ตั้งแต่ก่อนคริสต์ศักราช 3500 ปี เพราะเป็นอาหารดูแลสุขภาพ ของกลุ่มชาติพันธุ์ในประเทศเม็กซิโก เนื่องจากเมล็ดเจียมีความสมบูรณ์ในด้านคุณค่าอาหาร และสามารถร่วมรับประทานกับอาหารทั่วไป รวมถึงเครื่องดื่มทุกประเภท ปัจจุบันเมล็ดเจียจึงเป็นที่นิยมแพร่หลายในหมู่นักกีฬา นักโภชนาการ กลุ่มชีวจิต มังสวิรัติ อีกทั้งยังเป็นที่นิยมชื่นชอบของผู้ที่ต้องการควบคุมน้ำหนัก ความดัน เบาหวาน และผู้ที่ต้องการดูแลผิวพรรณ สุขภาพภายใน บริโภคอย่างแพร่หลาย',
    price: 350,
    unit: 'ซอง',
    image: Grains,
    badge: 'BEST SELLER',
    tags: ['Rich in Omega-3', 'Non-GMO', 'Gluten-Free'],
    benefits: [
      { icon: 'mynaui:heart', title: 'Heart Health', text: 'โอเมก้า 3 สูง ช่วยบำรุงหัวใจและหลอดเลือด ลดคอเลสเตอรอล' },
      { icon: 'mynaui:activity', title: 'Weight Management', text: 'เส้นใยอาหารสูง พองตัวในกระเพาะ ช่วยให้อิ่มนาน ลดความอยากอาหาร' },
      { icon: 'mynaui:star', title: 'Skin & Beauty', text: 'อุดมไปด้วยสารต้านอนุมูลอิสระ ช่วยชะลอวัยและบำรุงผิวพรรณให้เปล่งปลั่ง' }
    ],
    rituals: [
      { step: '01', title: 'ผสมเครื่องดื่ม', text: 'เติม 1-2 ช้อนชาลงในน้ำเปล่า น้ำผลไม้ หรือนม ทิ้งไว้ 15 นาทีให้พองตัวก่อนดื่ม' },
      { step: '02', title: 'โรยบนอาหาร', text: 'โรยบนสลัด โยเกิร์ต หรือขนมหวานเพื่อเพิ่มความกรุบกรอบและคุณค่าทางอาหาร' },
      { step: '03', title: 'เจียพุดดิ้ง', text: 'ผสมเจียกับนมอัลมอนด์ ทิ้งไว้ข้ามคืนในตู้เย็น ตกแต่งด้วยผลไม้สดพร้อมทาน' }
    ],
    gallery: [Grains, Grains, Grains]
  },
  {
    id: 'whey-protein-vanilla',
    categoryId: 'whey-protein', // เชื่อมโยงไปยังหมวดหมู่ เวย์โปรตีน (อยู่ภายใต้โปรตีน)
    name: 'เวย์โปรตีน ไอโซเลต รสวนิลา',
    description: 'เวย์โปรตีน ไอโซเลต (Whey Protein Isolate) รสวนิลา เวย์โปรตีนที่เกิดจากนำเวย์โปรตีนคอนเซนเทรทมาผ่านกรรมวิธีต่างๆเพื่อให้ได้โปรตีนเข้มข้นมากขึ้น โดยอนุภาคของโปรตีนจะเล็กลงทำให้ดูดซึมเข้าสู่ร่างกายได้เร็วขึ้น เวย์โปรตีนชนิดนี้จะมีไขมันเเละน้ำตาลแลตโตสในปริมาณที่น้อยมาก จึงเหมาะกับคนที่ชอบออกกำลังกาย เพื่อเพิ่มกล้ามเนื้อ ควบคู่กับการควบคุมไขมัน เเละคาร์โบไฮเดรตเเบบไม่ต้องกลัวอ้วน ให้ให้ออกกำลังกายได้อย่างมีประสิทธิภาพมากขึ้น',
    price: 890,
    unit: 'กระปุก',
    image: Protein,
    badge: 'PREMIUM',
    tags: ['High Protein', 'Low Fat', 'No Added Sugar'],
    benefits: [
      { icon: 'mynaui:activity', title: 'Muscle Growth', text: 'โปรตีนบริสุทธิ์สูง ช่วยเสริมสร้างและฟื้นฟูกล้ามเนื้อหลังออกกำลังกายได้อย่างรวดเร็ว' },
      { icon: 'mynaui:lightning', title: 'Fast Absorption', text: 'อนุภาคเล็ก ดูดซึมไว ร่างกายนำไปใช้ได้ทันที' },
      { icon: 'mynaui:activity', title: 'Lean Physique', text: 'ไขมันและน้ำตาลต่ำมาก เหมาะสำหรับผู้ที่ต้องการลีนไขมันหรือควบคุมน้ำหนัก' }
    ],
    rituals: [
      { step: '01', title: 'Post-Workout', text: 'ชง 1 สกู๊ปกับน้ำเย็น 200ml ดื่มทันทีหลังออกกำลังกายภายใน 30 นาที' },
      { step: '02', title: 'Meal Replacement', text: 'ผสมกับข้าวโอ๊ต กล้วย และนมอัลมอนด์ ปั่นเป็นสมูทตี้แทนมื้ออาหาร' },
      { step: '03', title: 'Baking', text: 'นำไปเป็นส่วนผสมในการทำขนมคลีน เช่น แพนเค้กโปรตีน หรือโปรตีนบอล' }
    ],
    gallery: [Protein, Protein, Protein]
  },
  {
    id: 'acai-coffee',
    categoryId: 'coffee', // เชื่อมโยงไปยังหมวดหมู่ กาแฟ (อยู่ภายใต้เครื่องดื่ม)
    name: 'กาแฟ ผสมอาซาอิเบอร์รี่',
    description: 'กาแฟ ผสมอาซาอิ กาแฟที่มีคุณค่าจากซุปเปอร์ฟู้ด คือ อาซาอิ เบอร์รี่ เข้ากันอย่างลงตัวกับกาแฟพันธุ์คัดพิเศษ ที่หอมกรุ่น รวมถึงส่วนผสมอื่นๆ ที่ให้ประโยชน์ ต่อร่างกาย และผิวพรรณ เช่น ถั่วขาว แอลคานิทีน ไคโตซาน สาหร่าย สไปรูลิน่า และคอลลาเจนจากปลาทะเลน้ำลึก ในทุกซองที่คุณดื่ม “ หอม อิ่ม หุ่นดี มีไฟเบอร์สูง ”',
    price: 250,
    unit: 'กล่อง',
    image: Coffee,
    badge: 'NEW',
    tags: ['Antioxidant', 'Energy Boost', 'Collagen'],
    benefits: [
      { icon: 'mynaui:star', title: 'Anti-aging Support', text: 'อาซาอิเบอร์รี่และคอลลาเจน ช่วยต้านอนุมูลอิสระ บำรุงผิวพรรณให้ดูอ่อนเยาว์' },
      { icon: 'mynaui:lightning', title: 'Clean Energy', text: 'ให้ความสดชื่นกระปรี้กระเปร่าจากกาแฟพันธุ์คัดพิเศษ พร้อมเผาผลาญไขมันด้วยแอลคาร์นิทีน' },
      { icon: 'mynaui:shield-check', title: 'Digestive Health', text: 'ไฟเบอร์สูงและส่วนผสมของถั่วขาวช่วยให้อิ่มนานและดีต่อระบบขับถ่าย' }
    ],
    rituals: [
      { step: '01', title: 'Morning Kickstart', text: 'ชง 1 ซองกับน้ำร้อนดื่มทุกเช้าเพื่อปลุกความสดชื่นและกระตุ้นการเผาผลาญ' },
      { step: '02', title: 'Pre-workout', text: 'ดื่มก่อนออกกำลังกาย 30 นาทีเพื่อเพิ่มพลังงานและความทนทาน' },
      { step: '03', title: 'Iced Coffee', text: 'ชงในน้ำร้อนเล็กน้อย เติมน้ำแข็งและนมอัลมอนด์สำหรับกาแฟเย็นแคลอรี่ต่ำ' }
    ],
    gallery: [Coffee, Coffee, Coffee]
  }
]