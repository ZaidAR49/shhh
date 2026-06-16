import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RiUserLine } from 'react-icons/ri';

interface UserAvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ user, className, fallbackClassName }: UserAvatarProps) {
  // Check if image is a placeholder from a generator
  const isFakeImage = user.image && (
    user.image.includes('dicebear.com') ||
    user.image.includes('ui-avatars.com') ||
    user.image.includes('gravatar.com')
  );

  const imageSrc = isFakeImage ? undefined : (user.image || undefined);

  // Generate initials just like the top right corner
  let initials = '';
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
      initials = user.name.substring(0, 2).toUpperCase();
    }
  } else if (user.email) {
    initials = user.email.substring(0, 2).toUpperCase();
  }

  return (
    <Avatar className={className}>
      <AvatarImage src={imageSrc} alt={user.name || 'User'} className="object-cover" />
      <AvatarFallback className={fallbackClassName || "bg-primary/10 text-primary font-bold"}>
        {initials ? initials : <RiUserLine size={20} />}
      </AvatarFallback>
    </Avatar>
  );
}
