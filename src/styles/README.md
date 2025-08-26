# BettaFish Design System

## 📋 ภาพรวม

ระบบสีและการออกแบบที่เป็นมาตรฐานสำหรับโปรเจ็ค BettaFish เพื่อให้การพัฒนาเป็นไปอย่างสม่ำเสมอและสวยงาม

## 🎨 Color Palette

### สีหลัก (Primary Colors)
```css
.text-primary-600    /* สีหลักของแบรนด์ */
.bg-primary-100      /* สีพื้นหลังอ่อน */
.border-primary-300  /* สีขอบ */
```

### สีรอง (Secondary Colors)
```css
.text-secondary-600  /* สีรองของแบรนด์ */
.bg-secondary-50     /* สีพื้นหลังอ่อนมาก */
```

### สีสถานะ (Status Colors)
```css
.status-pending      /* สีเหลือง - รอดำเนินการ */
.status-approved     /* สีเขียว - อนุมัติแล้ว */
.status-rejected     /* สีแดง - ปฏิเสธ */
.status-active       /* สีน้ำเงิน - กำลังดำเนินการ */
```

## 🔤 Typography

### ลำดับความสำคัญของข้อความ
```css
.text-display       /* หัวข้อหลักขนาดใหญ่ */
.text-title         /* หัวข้อรอง */
.text-subtitle      /* หัวข้อย่อย */
.text-heading       /* หัวข้อทั่วไป */
.text-subheading    /* หัวข้อย่อยทั่วไป */
.text-body          /* ข้อความเนื้อหา */
.text-caption       /* ข้อความอธิบาย */
.text-muted         /* ข้อความอ่อน */
```

### ฟอนต์
- **Display/Headings**: Kanit, Noto Sans Thai
- **Body Text**: Noto Sans Thai, Kanit, Inter

## 🏗️ Components

### Cards
```css
.betta-card                 /* การ์ดพื้นฐาน */
.betta-card-interactive     /* การ์ดที่คลิกได้ */
.surface-primary            /* พื้นผิวหลัก */
.surface-elevated           /* พื้นผิวยกระดับ */
```

### Buttons
```css
.btn-primary               /* ปุ่มหลัก */
.btn-secondary            /* ปุ่มรอง */
.action-approve           /* ปุ่มอนุมัติ */
.action-reject            /* ปุ่มปฏิเสธ */
.action-pending           /* ปุ่มรอดำเนินการ */
```

### Forms
```css
.form-input-enhanced      /* อินพุตที่ปรับปรุงแล้ว */
.form-select-enhanced     /* เซเลคที่ปรับปรุงแล้ว */
.form-field              /* กลุ่มฟิลด์ */
```

## 📏 Layout & Spacing

### Containers
```css
.container-main          /* คอนเทนเนอร์หลัก */
.container-narrow        /* คอนเทนเนอร์แคบ */
.container-wide          /* คอนเทนเนอร์กว้าง */
```

### Spacing
```css
.spacing-xs              /* ระยะห่างเล็ก */
.spacing-sm              /* ระยะห่างปานกลาง */
.spacing-md              /* ระยะห่างมาตรฐาน */
.spacing-lg              /* ระยะห่างใหญ่ */
.spacing-xl              /* ระยะห่างใหญ่มาก */
```

### Sections
```css
.section                 /* เซคชั่นปกติ */
.section-large          /* เซคชั่นใหญ่ */
.section-hero           /* เซคชั่นหีโร่ */
```

## 🎯 Usage Examples

### หน้าหลัก
```jsx
<main className="surface-accent">
  <section className="betta-gradient-bg section-hero">
    <div className="container-main">
      <h1 className="text-display text-white">
        ยินดีต้อนรับสู่ <span className="betta-gradient-text">BettaFish</span>
      </h1>
      <p className="text-body-lg text-white/90">
        ระบบจัดการปลากัดที่ครบครันที่สุด
      </p>
    </div>
  </section>
</main>
```

### การ์ดกิจกรรม
```jsx
<div className="betta-card-interactive">
  <h3 className="text-heading">ชื่อกิจกรรม</h3>
  <p className="text-body">รายละเอียดกิจกรรม</p>
  <span className="status-active">กำลังดำเนินการ</span>
</div>
```

### ฟอร์ม
```jsx
<div className="form-field">
  <label className="form-label">ชื่อปลากัด</label>
  <input className="form-input-enhanced" />
</div>
```

## 🎭 States & Interactions

### สถานะการโต้ตอบ
```css
.interactive            /* โต้ตอบได้ */
.interactive-subtle     /* โต้ตอบแบบอ่อน */
```

### สถานะการโหลด
```css
.loading-container      /* คอนเทนเนอร์โหลด */
.loading-spinner-primary /* สปินเนอร์โหลด */
```

### สถานะว่าง
```css
.empty-state           /* สถานะไม่มีข้อมูล */
.empty-state-icon      /* ไอคอนสถานะว่าง */
```

## 📱 Responsive Design

### Breakpoints
- **xs**: 475px+
- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+
- **2xl**: 1536px+

### Responsive Utilities
```css
.mobile-only           /* แสดงแค่มือถือ */
.tablet-up            /* แสดงแท็บเล็ตขึ้นไป */
.desktop-up           /* แสดงเดสก์ท็อปขึ้นไป */
```

## 🌟 Best Practices

1. **ใช้ design tokens แทนการ hardcode สี**
   ```css
   ❌ .bg-blue-500
   ✅ .status-active
   ```

2. **ใช้ลำดับความสำคัญของฟอนต์**
   ```css
   ❌ .text-xl .font-bold
   ✅ .text-heading
   ```

3. **ใช้ spacing system**
   ```css
   ❌ .mt-6 .mb-4 .space-y-3
   ✅ .spacing-md
   ```

4. **ใช้ semantic class names**
   ```css
   ❌ .bg-green-100 .text-green-800
   ✅ .status-approved
   ```

## 🔧 Customization

หากต้องการปรับแต่งสี สามารถแก้ไขได้ที่:
- `tailwind.config.js` - สีหลักของระบบ
- `design-tokens.css` - component classes
- `global-utilities.css` - utility classes

## 📦 Files Structure

```
src/styles/
├── design-tokens.css     # Design system components
├── global-utilities.css  # Utility classes
└── README.md            # เอกสารนี้
```
