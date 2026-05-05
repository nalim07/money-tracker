import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onIconSelect }) => {
  const [customIcon, setCustomIcon] = useState('');

  // Popular emojis for categories
  const emojiIcons = [
    '💰', '💳', '🏦', '💸', '💎', '🪙', '💵', '💴',
    '🏠', '🚗', '🛒', '🍔', '☕', '👕', '✈️', '🎁',
    '📱', '💻', '📚', '🎵', '🏋️', '🐕', '🚲', '📷',
    '💊', '🎓', '🎮', '💼', '🏢', '🏭', '🏪', '⛽',
    '🍕', '🍷', '🍦', '📞', '📧', '📶', '💡', '🗑️',
    '♻️', '❤️', '👤', '🏆', '⚽', '🎨', '🌟', '🔥'
  ];

  // FontAwesome icons
  const fontAwesomeIcons = [
    { icon: faWallet, name: 'wallet' },
    { icon: faCoins, name: 'coins' },
    { icon: faDollarSign, name: 'dollar-sign' },
    { icon: faMoneyBill, name: 'money-bill' },
    { icon: faPiggyBank, name: 'piggy-bank' },
    { icon: faUniversity, name: 'university' },
    { icon: faCreditCard, name: 'credit-card' },
    { icon: faHome, name: 'home' },
    { icon: faCar, name: 'car' },
    { icon: faShoppingCart, name: 'shopping-cart' },
    { icon: faUtensils, name: 'utensils' },
    { icon: faCoffee, name: 'coffee' },
    { icon: faShirt, name: 'shirt' },
    { icon: faPlane, name: 'plane' },
    { icon: faGift, name: 'gift' },
    { icon: faPhone, name: 'phone' },
    { icon: faLaptop, name: 'laptop' },
    { icon: faBook, name: 'book' },
    { icon: faMusic, name: 'music' },
    { icon: faDumbbell, name: 'dumbbell' },
    { icon: faDog, name: 'dog' },
    { icon: faBicycle, name: 'bicycle' },
    { icon: faCamera, name: 'camera' },
    { icon: faMedkit, name: 'medkit' },
    { icon: faGraduationCap, name: 'graduation-cap' },
    { icon: faGamepad, name: 'gamepad' },
    { icon: faBriefcase, name: 'briefcase' },
    { icon: faBuilding, name: 'building' },
    { icon: faIndustry, name: 'industry' },
    { icon: faStore, name: 'store' },
    { icon: faGasPump, name: 'gas-pump' },
    { icon: faHamburger, name: 'hamburger' },
    { icon: faWineGlass, name: 'wine-glass' },
    { icon: faEnvelope, name: 'envelope' },
    { icon: faWifi, name: 'wifi' },
    { icon: faLightbulb, name: 'lightbulb' },
    { icon: faTrash, name: 'trash' },
    { icon: faRecycle, name: 'recycle' },
    { icon: faHeart, name: 'heart' },
    { icon: faUser, name: 'user' }
  ];

  // Lucide icons
  const lucideIcons = [
    { icon: Wallet, name: 'lucide-wallet' },
    { icon: Coins, name: 'lucide-coins' },
    { icon: DollarSign, name: 'lucide-dollar-sign' },
    { icon: Banknote, name: 'lucide-banknote' },
    { icon: PiggyBank, name: 'lucide-piggy-bank' },
    { icon: Landmark, name: 'lucide-landmark' },
    { icon: CreditCard, name: 'lucide-credit-card' },
    { icon: Home, name: 'lucide-home' },
    { icon: Car, name: 'lucide-car' },
    { icon: ShoppingCart, name: 'lucide-shopping-cart' },
    { icon: Utensils, name: 'lucide-utensils' },
    { icon: Coffee, name: 'lucide-coffee' },
    { icon: Shirt, name: 'lucide-shirt' },
    { icon: Plane, name: 'lucide-plane' },
    { icon: Gift, name: 'lucide-gift' },
    { icon: Phone, name: 'lucide-phone' },
    { icon: Laptop, name: 'lucide-laptop' },
    { icon: Book, name: 'lucide-book' },
    { icon: Music, name: 'lucide-music' },
    { icon: Dumbbell, name: 'lucide-dumbbell' },
    { icon: Dog, name: 'lucide-dog' },
    { icon: Bike, name: 'lucide-bike' },
    { icon: Camera, name: 'lucide-camera' },
    { icon: Cross, name: 'lucide-cross' },
    { icon: GraduationCap, name: 'lucide-graduation-cap' },
    { icon: Gamepad2, name: 'lucide-gamepad2' },
    { icon: Briefcase, name: 'lucide-briefcase' },
    { icon: Building, name: 'lucide-building' },
    { icon: Factory, name: 'lucide-factory' },
    { icon: Store, name: 'lucide-store' },
    { icon: Fuel, name: 'lucide-fuel' },
    { icon: Mail, name: 'lucide-mail' },
    { icon: Wifi, name: 'lucide-wifi' },
    { icon: Lightbulb, name: 'lucide-lightbulb' },
    { icon: Trash2, name: 'lucide-trash2' },
    { icon: Recycle, name: 'lucide-recycle' },
    { icon: Heart, name: 'lucide-heart' },
    { icon: User, name: 'lucide-user' }
  ];

  const handleCustomIconSubmit = () => {
    if (customIcon.trim()) {
      onIconSelect(customIcon.trim());
      setCustomIcon('');
    }
  };

  const renderSelectedIcon = (icon: string) => {
    // Check if it's an emoji
    if (/\p{Emoji}/u.test(icon)) {
      return <span className="text-2xl">{icon}</span>;
    }
    
    // Check if it's a FontAwesome icon
    const faIcon = fontAwesomeIcons.find(fa => fa.name === icon);
    if (faIcon) {
      return <FontAwesomeIcon icon={faIcon.icon} className="w-6 h-6" />;
    }
    
    // Check if it's a Lucide icon
    const lucideIcon = lucideIcons.find(l => l.name === icon);
    if (lucideIcon) {
      const IconComponent = lucideIcon.icon;
      return <IconComponent className="w-6 h-6" />;
    }
    
    // Check if it's a URL (uploaded image)
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return <img src={icon} alt="Custom icon" className="w-6 h-6 object-cover rounded" />;
    }
    
    // Fallback to text
    return <span className="text-sm">{icon}</span>;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Ikon</Label>
        <div className="mt-2 p-3 border rounded-lg bg-gray-50 flex items-center justify-center min-h-[60px]">
          {selectedIcon && renderSelectedIcon(selectedIcon)}
          {!selectedIcon && <span className="text-gray-400">Pilih ikon</span>}
        </div>
      </div>

      <Tabs defaultValue="emoji" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emoji">Emoji</TabsTrigger>
          <TabsTrigger value="fontawesome">FontAwesome</TabsTrigger>
          <TabsTrigger value="lucide">Lucide</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="emoji" className="mt-4">
          <ScrollArea className="h-40 w-full border rounded-lg p-2">
            <div className="grid grid-cols-8 gap-2">
              {emojiIcons.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className={`p-2 text-2xl rounded-lg border hover:bg-gray-100 transition-colors ${
                    selectedIcon === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => onIconSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="fontawesome" className="mt-4">
          <ScrollArea className="h-40 w-full border rounded-lg p-2">
            <div className="grid grid-cols-8 gap-2">
              {fontAwesomeIcons.map((iconData) => (
                <button
                  key={iconData.name}
                  type="button"
                  className={`p-2 rounded-lg border hover:bg-gray-100 transition-colors flex items-center justify-center ${
                    selectedIcon === iconData.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => onIconSelect(iconData.name)}
                >
                  <FontAwesomeIcon icon={iconData.icon} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="lucide" className="mt-4">
          <ScrollArea className="h-40 w-full border rounded-lg p-2">
            <div className="grid grid-cols-8 gap-2">
              {lucideIcons.map((iconData) => {
                const IconComponent = iconData.icon;
                return (
                  <button
                    key={iconData.name}
                    type="button"
                    className={`p-2 rounded-lg border hover:bg-gray-100 transition-colors flex items-center justify-center ${
                      selectedIcon === iconData.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => onIconSelect(iconData.name)}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-icon">URL Ikon atau Emoji</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-icon"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder="Masukkan URL gambar atau emoji"
                />
                <Button 
                  type="button" 
                  onClick={handleCustomIconSubmit}
                  disabled={!customIcon.trim()}
                >
                  Tambah
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contoh: https://example.com/icon.png atau 🏠
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};