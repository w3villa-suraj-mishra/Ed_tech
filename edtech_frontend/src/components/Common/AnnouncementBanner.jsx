import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getActiveAnnouncement, dismissAnnouncement } from '../../services/admin/announcementAPI';
import { FiClock, FiX, FiTag, FiArrowRight } from 'react-icons/fi';

export default function AnnouncementBanner() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});
  
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Fetch active announcement on mount or auth change
  useEffect(() => {
    let isMounted = true;

    const fetchBanner = async () => {
      try {
        const res = await getActiveAnnouncement(token);
        const payload = res?.data || res;
        if (isMounted && payload?.success && (payload.data || payload.announcement)) {
          const item = payload.data || payload.announcement;
          
          // Check session storage dismissal fallback for unauthenticated users
          const localDismissed = sessionStorage.getItem(`dismissed_announcement_${item.id}`);
          if (localDismissed === 'true') {
            setDismissed(true);
            return;
          }

          setAnnouncement(item);
        } else if (isMounted) {
          setAnnouncement(null);
        }
      } catch (err) {
        if (isMounted) setAnnouncement(null);
      }
    };

    fetchBanner();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Countdown timer handler with separate hours, minutes, seconds
  useEffect(() => {
    if (!announcement || !announcement.countdownEnabled || !announcement.endAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const end = new Date(announcement.endAt).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        setAnnouncement(null); // Auto expire and hide
        return false;
      }

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: totalHours,
        minutes: minutes,
        seconds: seconds
      });
      return true;
    };

    const valid = calculateTime();
    if (!valid) return;

    const timer = setInterval(() => {
      const stillValid = calculateTime();
      if (!stillValid) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [announcement]);

  const handleDismiss = async () => {
    if (!announcement) return;
    setDismissed(true);
    sessionStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true');

    try {
      await dismissAnnouncement(announcement.id, token);
    } catch (err) {
      // Ignore API errors on dismiss
    }
  };

  const handleCtaClick = () => {
    if (!announcement || !announcement.ctaUrl) return;
    let url = announcement.ctaUrl.trim();
    
    // Append promo code if present in announcement highlightText
    if (announcement.highlightText && !url.includes('code=')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}code=${encodeURIComponent(announcement.highlightText.trim())}`;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  if (!announcement || dismissed) {
    return null;
  }

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xs relative z-40 font-sans transition-all duration-300 overflow-x-auto no-scrollbar">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4 text-xs sm:text-sm whitespace-nowrap">
        
        {/* Left Section: Highlight Discount Code */}
        {announcement.highlightText && (
          <div className="flex items-center gap-1.5 text-slate-300 font-medium text-xs tracking-normal shrink-0 whitespace-nowrap">
            <FiTag className="text-blue-400" />
            <span>Promo:</span>
            <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">{announcement.highlightText}</span>
          </div>
        )}

        {/* Center Section: Main Description / Message */}
        <div className="text-slate-200 font-medium tracking-wide text-center truncate whitespace-nowrap mx-auto px-2">
          {announcement.message || announcement.title}
        </div>

        {/* Right Section: Countdown Timer, CTA Button & Close Icon */}
        <div className="flex items-center justify-end gap-3 shrink-0 whitespace-nowrap">
          
          {/* Detailed Countdown display: X hours Y minutes Z seconds */}
          {announcement.countdownEnabled && timeLeft && (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap">
              <FiClock className="text-blue-400 text-xs" />
              <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-mono font-semibold text-xs border border-slate-700">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          )}

          {/* CTA Button */}
          {announcement.ctaEnabled && announcement.ctaText && (
            <button
              onClick={handleCtaClick}
              className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-sm shrink-0 whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{announcement.ctaText}</span>
              <FiArrowRight className="text-xs" />
            </button>
          )}

          {/* Close Dismiss Button */}
          {announcement.dismissible && (
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-800 shrink-0"
              title="Dismiss announcement"
              aria-label="Close Announcement"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
