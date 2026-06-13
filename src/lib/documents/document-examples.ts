// 单据示例数据
// 用于演示和测试，帮助用户快速了解单据格式

export interface DocumentExample {
  type: string;
  formData: Record<string, any>;
  lineItems: Record<string, any>[];
}

export const documentExamples: Record<string, DocumentExample> = {
  'packing-list': {
    type: 'packing-list',
    formData: {
      documentNo: 'PL-2024-001',
      documentDate: '2024-06-15',
      invoiceNo: 'CI-2024-001',
      referenceNo: 'PO-2024-0520',
      shipper: '上海贸易有限公司\n上海市浦东新区张江路100号\n电话: +86-21-1234-5678',
      consignee: 'ABC Trading Co., Ltd.\n123 Main Street, Los Angeles, CA 90001, USA\nTel: +1-213-555-0123',
      portOfLoading: '上海港',
      portOfDestination: '洛杉矶港',
      marks: 'ABC\nLOS ANGELES\nC/NO. 1-10\nMADE IN CHINA',
      remarks: '请小心轻放，防潮',
    },
    lineItems: [
      {
        cartonNo: '1-5',
        description: 'LED灯泡 LED Bulb A19',
        quantity: '500',
        unit: 'PCS',
        grossWeight: '25.0',
        netWeight: '22.5',
        volume: '0.50',
        remark: '',
      },
      {
        cartonNo: '6-10',
        description: 'USB充电线 USB Charging Cable',
        quantity: '1000',
        unit: 'PCS',
        grossWeight: '30.0',
        netWeight: '28.0',
        volume: '0.30',
        remark: '',
      },
    ],
  },

  'proforma-invoice': {
    type: 'proforma-invoice',
    formData: {
      documentNo: 'PI-2024-001',
      documentDate: '2024-06-15',
      expiryDate: '2024-07-15',
      companyName: '上海贸易有限公司',
      companyNameEn: 'Shanghai Trading Co., Ltd.',
      companyAddress: '上海市浦东新区张江路100号',
      companyPhone: '+86-21-1234-5678',
      companyEmail: 'sales@shanghai-trading.com',
      companyWebsite: 'www.shanghai-trading.com',
      buyerName: 'ABC Trading Co., Ltd.',
      buyerAddress: '123 Main Street, Los Angeles, CA 90001, USA',
      buyerContact: 'John Smith',
      buyerPhone: '+1-213-555-0123',
      buyerEmail: 'john@abc-trading.com',
      transportMode: '海运',
      portOfLoading: '上海港',
      portOfDestination: '洛杉矶港',
      paymentTerms: 'T/T',
      tradeTerms: 'FOB',
      currency: 'USD',
      subtotal: '15000.00',
      freight: '800.00',
      insurance: '50.00',
      discount: '0',
      otherCharges: '0',
      bankName: '中国银行上海分行',
      bankAddress: '上海市浦东新区银城中路200号',
      accountName: '上海贸易有限公司',
      accountNumber: '4580 1234 5678 9012',
      swiftCode: 'BKCHCNBJ300',
      iban: '',
      remarks: '请在收到货物后7天内完成付款',
    },
    lineItems: [
      {
        description: 'LED灯泡 LED Bulb A19 10W',
        specification: '10W, E27, 3000K',
        quantity: '500',
        unit: 'PCS',
        unitPrice: '12.00',
        amount: '6000.00',
        remark: '',
      },
      {
        description: 'USB充电线 USB Charging Cable 1m',
        specification: 'Type-C, 1m',
        quantity: '1000',
        unit: 'PCS',
        unitPrice: '9.00',
        amount: '9000.00',
        remark: '',
      },
    ],
  },

  'commercial-invoice': {
    type: 'commercial-invoice',
    formData: {
      documentNo: 'CI-2024-001',
      documentDate: '2024-06-15',
      shipper: '上海贸易有限公司\n上海市浦东新区张江路100号\n电话: +86-21-1234-5678',
      consignee: 'ABC Trading Co., Ltd.\n123 Main Street, Los Angeles, CA 90001, USA\nTel: +1-213-555-0123',
      notifyParty: 'Customs Broker Inc.\n456 Harbor Blvd, Long Beach, CA 90802',
      vesselVoyage: 'COSCO STAR V.123E',
      billOfLadingNo: 'COSU1234567890',
      countryOfTrade: '美国',
      countryOfOrigin: '中国',
      marks: 'ABC\nLOS ANGELES\nC/NO. 1-10\nMADE IN CHINA',
      declaration: 'We declare that this invoice shows the full value of the goods and that all particulars are true and correct.',
    },
    lineItems: [
      {
        marks: 'ABC',
        description: 'LED灯泡 LED Bulb A19 10W',
        hsCode: '8539.50',
        quantity: '500',
        unit: 'PCS',
        unitPrice: '12.00',
        amount: '6000.00',
        remark: '',
      },
      {
        marks: 'ABC',
        description: 'USB充电线 USB Charging Cable 1m',
        hsCode: '8544.42',
        quantity: '1000',
        unit: 'PCS',
        unitPrice: '9.00',
        amount: '9000.00',
        remark: '',
      },
    ],
  },

  'quotation': {
    type: 'quotation',
    formData: {
      documentNo: 'QT-2024-001',
      documentDate: '2024-06-15',
      expiryDate: '2024-07-15',
      companyName: '上海贸易有限公司',
      buyerName: 'ABC Trading Co., Ltd.',
      paymentTerms: 'T/T',
      deliveryTime: '15-20 days after order confirmation',
      terms: '1. 以上报价不含税，如需含税另加13%增值税\n2. 付款方式：30%预付款，70%发货前付清\n3. 交货期：收到预付款后15-20天\n4. 报价有效期：30天',
      quotationPerson: '张经理',
      contactInfo: '+86-21-1234-5678 / sales@shanghai-trading.com',
    },
    lineItems: [
      {
        description: 'LED灯泡 LED Bulb A19 10W',
        specification: '10W, E27, 3000K, 110V',
        quantity: '500',
        unit: 'PCS',
        unitPrice: '12.00',
        amount: '6000.00',
      },
      {
        description: 'USB充电线 USB Charging Cable 1m',
        specification: 'Type-C to USB-A, 1m, 2A',
        quantity: '1000',
        unit: 'PCS',
        unitPrice: '9.00',
        amount: '9000.00',
      },
    ],
  },
};

export function getDocumentExample(type: string): DocumentExample | null {
  return documentExamples[type] || null;
}
