export const INITIAL_RESTAURANTS = [
    {
      id: '1',
      name: 'Spicy Villa',
      type: 'Fine Dining',
      cuisine: 'North Indian, Mughlai', // Added cuisine
      location: 'Pune, MH',
      phone: '9876543210',
      email: 'contact@spicyvilla.com',
      website: 'www.spicyvilla.com',
      address: '123, MG Road, Camp',
      wifi: { ssid: 'Spicy_Guest', pass: 'chilli123' },
      reviews: [
        { id: 'r1', user: 'Amit', text: 'Great Biryani!', rating: 5 },
        { id: 'r2', user: 'Sara', text: 'Authentic taste but slow service.', rating: 3 },
      ],
      menu: [
        { id: 'm1', name: 'Paneer Tikka', price: 250 },
        { id: 'm2', name: 'Butter Naan', price: 40 },
      ],
      createdAt: '2023-10-01',
      lastUpdate: '2025-12-23'
    },
    {
      id: '2',
      name: 'Burger King',
      type: 'Quick Service',
      cuisine: 'American, Fast Food', // Added cuisine
      location: 'Pimpri, MH',
      phone: '1800-222-333',
      email: 'support@burgerking.in',
      website: 'www.burgerking.in',
      address: 'City One Mall, Pimpri',
      wifi: { ssid: 'BK_Free', pass: 'whopper' },
      reviews: [
        { id: 'r3', user: 'Rahul', text: 'Fast service and hot fries.', rating: 4 },
      ],
      menu: [
        { id: 'm3', name: 'Whopper', price: 199 },
        { id: 'm4', name: 'Large Fries', price: 99 },
      ],
      createdAt: '2023-05-15',
      lastUpdate: '2025-12-20'
    }
  ];