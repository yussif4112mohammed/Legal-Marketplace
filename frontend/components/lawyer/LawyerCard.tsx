import Link from 'next/link';
import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import StarRating from '../shared/StarRating';

interface LawyerCardProps {
  lawyer: {
    id: number;
    first_name: string;
    last_name: string;
    law_firm?: string;
    city?: string;
    state?: string;
    years_experience: number;
    consultation_fee: number;
    avg_rating: number;
    total_reviews: number;
    bio?: string;
    specializations?: string;
    avatar_url?: string;
  };
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
  const initials = `${lawyer.first_name?.[0] ?? ''}${lawyer.last_name?.[0] ?? ''}`;
  const specs = lawyer.specializations?.split(', ').filter(Boolean) ?? [];
  const location = [lawyer.city, lawyer.state].filter(Boolean).join(', ');

  return (
    <Link
      href={`/lawyers/${lawyer.id}`}
      className="card p-6 flex flex-col gap-4 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0">
          {lawyer.avatar_url ? (
            <img
              src={lawyer.avatar_url}
              alt={`${lawyer.first_name} ${lawyer.last_name}`}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-navy-900 text-white flex items-center justify-center text-lg font-bold"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-navy-950 text-base group-hover:text-navy-700 transition-colors leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            {lawyer.first_name} {lawyer.last_name}
          </h3>
          {lawyer.law_firm && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{lawyer.law_firm}</p>
          )}
          <div className="mt-1.5">
            <StarRating rating={lawyer.avg_rating} size="xs" showValue totalReviews={lawyer.total_reviews} />
          </div>
        </div>
      </div>

      {/* Bio snippet */}
      {lawyer.bio && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{lawyer.bio}</p>
      )}

      {/* Specialization badges */}
      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specs.slice(0, 2).map(s => (
            <span key={s} className="badge-gold">{s}</span>
          ))}
          {specs.length > 2 && (
            <span className="badge-gray">+{specs.length - 2}</span>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
        {location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {lawyer.years_experience} yrs exp.
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1 font-semibold text-navy-900 text-sm">
          <DollarSign className="w-4 h-4" />{lawyer.consultation_fee}/hr
        </span>
        <span className="text-xs text-navy-700 font-medium group-hover:text-gold-600 transition-colors">
          View Profile →
        </span>
      </div>
    </Link>
  );
}
