import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register Thai font (TH Sarabun New)
Font.register({
  family: 'Sarabun',
  src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVjJx26TKEr37c9aAFJn2QN_a2X1.woff2',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Sarabun',
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1 solid #000',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
  },
  value: {
    width: '60%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1 solid #ccc',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

interface SalarySlipProps {
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  totalTrips: number;
  totalTripIncome: number;
  totalAdvances: number;
  netSalary: number;
  isPaid: boolean;
  paidDate?: string;
}

const monthNames = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export function SalarySlipPDF({
  employeeName,
  month,
  year,
  baseSalary,
  totalTrips,
  totalTripIncome,
  totalAdvances,
  netSalary,
  isPaid,
  paidDate,
}: SalarySlipProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>สลิปเงินเดือน</Text>
          <Text style={styles.subtitle}>
            เดือน {monthNames[month - 1]} พ.ศ. {year + 543}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูลพนักงาน</Text>
          <View style={styles.row}>
            <Text style={styles.label}>ชื่อพนักงาน:</Text>
            <Text style={styles.value}>{employeeName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>เดือน:</Text>
            <Text style={styles.value}>
              {monthNames[month - 1]} {year}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>รายละเอียดเงินเดือน</Text>
          <View style={styles.row}>
            <Text style={styles.label}>เงินเดือนฐาน:</Text>
            <Text style={styles.value}>{formatCurrency(baseSalary)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>จำนวนเที่ยว:</Text>
            <Text style={styles.value}>{totalTrips} เที่ยว</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>รายได้จากเที่ยว:</Text>
            <Text style={styles.value}>{formatCurrency(totalTripIncome)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>เบิกเงินล่วงหน้า:</Text>
            <Text style={styles.value}>
              -{formatCurrency(totalAdvances)}
            </Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text>เงินเดือนสุทธิ:</Text>
          <Text>{formatCurrency(netSalary)}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>สถานะการจ่าย:</Text>
            <Text style={styles.value}>{isPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}</Text>
          </View>
          {isPaid && paidDate && (
            <View style={styles.row}>
              <Text style={styles.label}>วันที่จ่าย:</Text>
              <Text style={styles.value}>{paidDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>เอกสารนี้สร้างโดยระบบจัดการสต็อกวัสดุก่อสร้าง</Text>
          <Text>
            สร้างเมื่อ: {new Date().toLocaleDateString('th-TH')}{' '}
            {new Date().toLocaleTimeString('th-TH')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

