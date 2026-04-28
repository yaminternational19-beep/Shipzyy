export const mockRefunds = [
    {
        id: 'REF-2001',
        userId: 'CUST-0041',
        orderId: 'ORD-1143',
        userName: 'Praveen Reddy',
        userType: 'CUSTOMER',
        userPhone: '+91 90000 00001',
        userEmail: 'praveen@shipzzy.com',
        amount: 1299.00,
        reason: 'Item was damaged during transit. The packaging was torn.',
        reasonCategory: 'Damaged Product',
        status: 'Pending',
        date: '2026-04-28T10:30:00Z',
        adminNotes: '',
        items: [
            {
                name: 'Premium Leather Jacket',
                image: 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png',
                price: 1299.00,
                qty: 1
            }
        ]
    },
    {
        id: 'REF-2002',
        userId: 'CUST-0055',
        orderId: 'ORD-1156',
        userName: 'Alice Smith',
        userType: 'CUSTOMER',
        userPhone: '+91 99887 76655',
        userEmail: 'alice.s@example.com',
        amount: 450.00,
        reason: 'Received wrong size. Ordered XL but got M.',
        reasonCategory: 'Wrong Item',
        status: 'Approved',
        date: '2026-04-27T15:20:00Z',
        adminNotes: 'Verified with vendor logs. Correct size was not shipped.',
        items: [
            {
                name: 'Cotton Polo T-Shirt',
                image: 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png',
                price: 450.00,
                qty: 1
            }
        ]
    },
    {
        id: 'REF-2003',
        userId: 'RID-502',
        orderId: 'TRP-5531',
        userName: 'Bob Rider',
        userType: 'RIDER',
        userPhone: '+91 77766 55544',
        userEmail: 'bob.rider@delivery.com',
        amount: 250.00,
        reason: 'Reimbursement for fuel and maintenance during long-distance delivery.',
        reasonCategory: 'Reimbursement',
        status: 'Pending',
        date: '2026-04-28T09:00:00Z',
        adminNotes: '',
        items: [
            {
                name: 'Fuel Adjustment',
                image: null,
                price: 250.00,
                qty: 1
            }
        ]
    },
    {
        id: 'REF-2004',
        userId: 'CUST-0110',
        orderId: 'ORD-1188',
        userName: 'Emma Watson',
        userType: 'CUSTOMER',
        userPhone: '+91 66677 88899',
        userEmail: 'emma.w@example.com',
        amount: 2999.00,
        reason: 'Product quality is very poor compared to the description.',
        reasonCategory: 'Quality Issue',
        status: 'Rejected',
        date: '2026-04-26T11:00:00Z',
        adminNotes: 'User has excessive refund requests. Quality verified by vendor as standard.',
        items: [
            {
                name: 'Mechanical Gaming Keyboard',
                image: 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png',
                price: 2999.00,
                qty: 1
            }
        ]
    },
    {
        id: 'REF-2005',
        userId: 'RID-508',
        orderId: 'TRP-5420',
        userName: 'Charlie Rider',
        userType: 'RIDER',
        userPhone: '+91 88877 66655',
        userEmail: 'charlie@rider.com',
        amount: 150.00,
        reason: 'Customer was unavailable at the location after 15 mins wait.',
        reasonCategory: 'Wait Time Compensation',
        status: 'Approved',
        date: '2026-04-25T10:00:00Z',
        adminNotes: 'Verified via GPS and call logs. Rider waited 18 minutes.',
        items: [
            {
                name: 'Wait Time (15m+)',
                image: null,
                price: 150.00,
                qty: 1
            }
        ]
    },
    {
        id: 'REF-2006',
        userId: 'CUST-0240',
        orderId: 'ORD-1205',
        userName: 'David Miller',
        userType: 'CUSTOMER',
        userPhone: '+91 99001 12233',
        userEmail: 'david.m@example.com',
        amount: 899.00,
        reason: 'Items missing from the package.',
        reasonCategory: 'Missing Items',
        status: 'Pending',
        date: '2026-04-28T11:45:00Z',
        adminNotes: '',
        items: [
            {
                name: 'Bluetooth Earbuds',
                image: 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png',
                price: 899.00,
                qty: 1
            }
        ]
    }
];
