import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Sarabun',
  src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVjJx26TKEr37c9aAFJn2QN_a2X1.woff2',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Sarabun',
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #ddd',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  tableCell: {
    paddingHorizontal: 8,
  },
  col1: { width: '15%' },
  col2: { width: '25%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  col6: { width: '15%' },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1 solid #ccc',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

interface StockTransaction {
  id: number;
  date: string;
  type: 'in' | 'out';
  materialName: string;
  quantity: number;
  unit: string;
  customer?: string;
  supplier?: string;
}

interface StockReportProps {
  title: string;
  startDate?: string;
  endDate?: string;
  transactions: StockTransaction[];
}

export function StockReportPDF({
  title,
  startDate,
  endDate,
  transactions,
}: StockReportProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {startDate && endDate && (
            <Text style={styles.subtitle}>
              วันที่ {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.col1]}>วันที่</Text>
            <Text style={[styles.tableCell, styles.col2]}>วัสดุ</Text>
            <Text style={[styles.tableCell, styles.col3]}>ประเภท</Text>
            <Text style={[styles.tableCell, styles.col4]}>จำนวน</Text>
            <Text style={[styles.tableCell, styles.col5]}>หน่วย</Text>
            <Text style={[styles.tableCell, styles.col6]}>หมายเหตุ</Text>
          </View>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>
                {formatDate(transaction.date)}
              </Text>
              <Text style={[styles.tableCell, styles.col2]}>
                {transaction.materialName}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {transaction.type === 'in' ? 'เข้า' : 'ออก'}
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>
                {transaction.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.col5]}>
                {transaction.unit}
              </Text>
              <Text style={[styles.tableCell, styles.col6]}>
                {transaction.customer || transaction.supplier || '-'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>รายงานนี้สร้างโดยระบบจัดการสต็อกวัสดุก่อสร้าง</Text>
          <Text>
            สร้างเมื่อ: {new Date().toLocaleDateString('th-TH')}{' '}
            {new Date().toLocaleTimeString('th-TH')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

