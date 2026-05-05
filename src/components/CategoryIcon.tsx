import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faHome, faUser, faCar, faShoppingCart, faGamepad, 
  faUtensils, faMedkit, faGraduationCap, faShirt, faPlane, 
  faGift, faCoffee, faMusic, faBook, faDumbbell, faDog, 
  faBicycle, faCamera, faLaptop, faWallet, faCreditCard,
  faCoins, faDollarSign, faMoneyBill, faPiggyBank, faUniversity,
  faBriefcase, faBuilding, faIndustry, faStore, faGasPump,
  faHamburger, faWineGlass, faPhone,
  faEnvelope, faWifi, faLightbulb, faTrash, faRecycle
} from '@fortawesome/free-solid-svg-icons';
import { 
  Heart, Home, User, Car, ShoppingCart, Gamepad2, 
  Utensils, Cross, GraduationCap, Shirt, Plane, 
  Gift, Coffee, Music, Book, Dumbbell, Dog,
  Bike, Camera, Laptop, Wallet, CreditCard,
  Coins, DollarSign, Banknote, PiggyBank, Landmark,
  Briefcase, Building, Factory, Store, Fuel,
  Phone, Mail, Wifi, Lightbulb, Trash2, Recycle
} from 'lucide-react';
import { Tag } from 'lucide-react';

interface CategoryIconProps {
  icon: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = "w-5 h-5", color }) => {
  // Check if it's an emoji
  if (/\p{Emoji}/u.test(icon)) {
    return <span className={`${className.includes('w-') ? '' : 'text-lg'}`} style={{ color }}>{icon}</span>;
  }
  
  // FontAwesome icons mapping
  const fontAwesomeIcons: Record<string, any> = {
    'wallet': faWallet,
    'coins': faCoins,
    'dollar-sign': faDollarSign,
    'money-bill': faMoneyBill,
    'piggy-bank': faPiggyBank,
    'university': faUniversity,
    'credit-card': faCreditCard,
    'home': faHome,
    'car': faCar,
    'shopping-cart': faShoppingCart,
    'utensils': faUtensils,
    'coffee': faCoffee,
    'shirt': faShirt,
    'plane': faPlane,
    'gift': faGift,
    'phone': faPhone,
    'laptop': faLaptop,
    'book': faBook,
    'music': faMusic,
    'dumbbell': faDumbbell,
    'dog': faDog,
    'bicycle': faBicycle,
    'camera': faCamera,
    'medkit': faMedkit,
    'graduation-cap': faGraduationCap,
    'gamepad': faGamepad,
    'briefcase': faBriefcase,
    'building': faBuilding,
    'industry': faIndustry,
    'store': faStore,
    'gas-pump': faGasPump,
    'hamburger': faHamburger,
    'wine-glass': faWineGlass,
    'envelope': faEnvelope,
    'wifi': faWifi,
    'lightbulb': faLightbulb,
    'trash': faTrash,
    'recycle': faRecycle,
    'heart': faHeart,
    'user': faUser
  };
  
  // Check if it's a FontAwesome icon
  const faIcon = fontAwesomeIcons[icon];
  if (faIcon) {
    return <FontAwesomeIcon icon={faIcon} className={className} style={{ color }} />;
  }
  
  // Lucide icons mapping
  const lucideIcons: Record<string, React.ComponentType<any>> = {
    'lucide-wallet': Wallet,
    'lucide-coins': Coins,
    'lucide-dollar-sign': DollarSign,
    'lucide-banknote': Banknote,
    'lucide-piggy-bank': PiggyBank,
    'lucide-landmark': Landmark,
    'lucide-credit-card': CreditCard,
    'lucide-home': Home,
    'lucide-car': Car,
    'lucide-shopping-cart': ShoppingCart,
    'lucide-utensils': Utensils,
    'lucide-coffee': Coffee,
    'lucide-shirt': Shirt,
    'lucide-plane': Plane,
    'lucide-gift': Gift,
    'lucide-phone': Phone,
    'lucide-laptop': Laptop,
    'lucide-book': Book,
    'lucide-music': Music,
    'lucide-dumbbell': Dumbbell,
    'lucide-dog': Dog,
    'lucide-bike': Bike,
    'lucide-camera': Camera,
    'lucide-cross': Cross,
    'lucide-graduation-cap': GraduationCap,
    'lucide-gamepad2': Gamepad2,
    'lucide-briefcase': Briefcase,
    'lucide-building': Building,
    'lucide-factory': Factory,
    'lucide-store': Store,
    'lucide-fuel': Fuel,
    'lucide-mail': Mail,
    'lucide-wifi': Wifi,
    'lucide-lightbulb': Lightbulb,
    'lucide-trash2': Trash2,
    'lucide-recycle': Recycle,
    'lucide-heart': Heart,
    'lucide-user': User
  };
  
  // Check if it's a Lucide icon
  const LucideIconComponent = lucideIcons[icon];
  if (LucideIconComponent) {
    return <LucideIconComponent className={className} style={{ color }} />;
  }
  
  // Check if it's a URL (uploaded image)
  if (icon.startsWith('http') || icon.startsWith('/')) {
    return <img src={icon} alt="Category icon" className={`${className} object-cover rounded`} />;
  }
  
  // Fallback to Tag icon for unknown icons
  return <Tag className={className} style={{ color }} />;
};