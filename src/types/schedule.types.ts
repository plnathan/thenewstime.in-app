export interface AdvertisementScheduleValue {
  startDateTime: string;
  endDateTime: string;
  timezone: string;
}

export interface AdvertisementScheduleValidation {
  isValid: boolean;
  message: string;
}

export interface AdvertisementScheduleProps {
  value: AdvertisementScheduleValue;
  onChange: (value: AdvertisementScheduleValue) => void;
}
