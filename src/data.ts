export type Person = {
  id: string;
  name: string;
  org: string;
  verified: boolean;
  rating: number;
  reviews: number;
  time: string;
  walkTo: string;
  ride: string;
  walkFrom: string;
  points: number;
  match: number;
  vehicle: 'car' | 'bike';
};

// Sample data modelled on the reference screenshots.
export const rideGivers: Person[] = [
  { id: '1', name: 'Srinath', org: 'Govt ID Verified', verified: true, rating: 4.9, reviews: 64, time: '5:31 pm', walkTo: '720 m', ride: '10.71 km', walkFrom: '229 m', points: 66, match: 100, vehicle: 'car' },
  { id: '2', name: 'Ashok', org: 'Govt ID Verified', verified: true, rating: 5, reviews: 31, time: '5:45 pm', walkTo: '100 m', ride: '11.42 km', walkFrom: '229 m', points: 60, match: 100, vehicle: 'car' },
  { id: '3', name: 'Sonu', org: 'Govt ID Verified', verified: true, rating: 5, reviews: 12, time: '6:01 pm', walkTo: '450 m', ride: '10.9 km', walkFrom: '300 m', points: 58, match: 92, vehicle: 'car' },
  { id: '4', name: 'Roshan Bernad', org: 'Verified', verified: true, rating: 5, reviews: 19, time: '5:45 pm', walkTo: '440 m', ride: '8.8 km', walkFrom: '2.7 km', points: 43, match: 72, vehicle: 'bike' },
];

export const rideTakers: Person[] = [
  { id: 't1', name: 'Arathi', org: 'IBM', verified: true, rating: 4.9, reviews: 185, time: '5:30 pm', walkTo: '5.31 km', ride: '6.78 km', walkFrom: '440 m', points: 37, match: 77, vehicle: 'car' },
  { id: 't2', name: 'Athira Vijayan', org: 'Thinkpal, Govt ID', verified: true, rating: 5, reviews: 115, time: '5:34 pm', walkTo: '1.61 km', ride: '6.85 km', walkFrom: '1.23 km', points: 37, match: 79, vehicle: 'car' },
  { id: 't3', name: 'Ashma Byju', org: 'IBS Software Services', verified: false, rating: 5, reviews: 8, time: '6:05 pm', walkTo: '6.54 km', ride: '6.86 km', walkFrom: '590 m', points: 35, match: 66, vehicle: 'car' },
  { id: 't4', name: 'Abhinav A T', org: 'Not Verified', verified: false, rating: 5, reviews: 3, time: '5:48 pm', walkTo: '1.66 km', ride: '6.83 km', walkFrom: '1.24 km', points: 37, match: 72, vehicle: 'car' },
];

export const menuItems: { label: string; icon: string }[] = [
  { label: 'Profile', icon: 'account-circle-outline' },
  { label: 'Settings', icon: 'cog-outline' },
  { label: 'Carpools', icon: 'account-group-outline' },
  { label: 'Taxi trips', icon: 'taxi' },
  { label: 'Payments', icon: 'wallet-outline' },
  { label: 'Referral & Rewards', icon: 'gift-outline' },
  { label: 'Favorites', icon: 'heart-outline' },
  { label: 'Vehicles', icon: 'car-outline' },
  { label: 'Community', icon: 'account-multiple-outline' },
];
