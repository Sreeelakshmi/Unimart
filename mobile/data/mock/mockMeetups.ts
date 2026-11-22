// mobile/data/mock/mockMeetups.ts
// Certified Safe Meetup Locations on Campus

import type { CampusMeetupLocation } from '../../../shared/types/meetup';

export const MOCK_MEETUP_LOCATIONS: CampusMeetupLocation[] = [
  {
    id: 'meetup-loc-1',
    name: 'Central Library — Main Entrance Lobby',
    description: 'High visibility, 24/7 CCTV surveillance, campus security post right beside entry turnstiles.',
    campusZone: 'Academic Core — North Campus',
    safeZoneCertified: true,
    operatingHours: '08:00 AM – 11:00 PM',
    latitude: 28.545,
    longitude: 77.192,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'meetup-loc-2',
    name: 'Student Activity Center (SAC) Cafe',
    description: 'Popular student hangout area with ample seating, good lighting, and open public visibility.',
    campusZone: 'Student Hub — West Campus',
    safeZoneCertified: true,
    operatingHours: '09:00 AM – 10:00 PM',
    latitude: 28.543,
    longitude: 77.189,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'meetup-loc-3',
    name: 'Hostel Block C — Visitors Reception',
    description: 'Guarded gate entry, security logbook check-in, bright common waiting lounge with CCTV.',
    campusZone: 'Residential Sector — South Campus',
    safeZoneCertified: true,
    operatingHours: '10:00 AM – 08:30 PM',
    latitude: 28.541,
    longitude: 77.194,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'meetup-loc-4',
    name: 'Campus Main Gate Security Kiosk',
    description: 'Staffed 24/7 by University Security Officers with perimeter cameras and bright floodlights.',
    campusZone: 'Perimeter Security Checkpoint',
    safeZoneCertified: true,
    operatingHours: '24 Hours Open',
    latitude: 28.548,
    longitude: 77.195,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'meetup-loc-5',
    name: 'Faculty & Lecture Hall Complex Atrium',
    description: 'Spacious central hall between Lecture Theatres 1-4 with security desk and cafe kiosk.',
    campusZone: 'Academic Complex — East Wing',
    safeZoneCertified: true,
    operatingHours: '08:30 AM – 07:30 PM',
    latitude: 28.546,
    longitude: 77.191,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

