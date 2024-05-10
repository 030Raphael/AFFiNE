import dayjs from 'dayjs';

function createTimeFormatter() {
  return new Intl.DateTimeFormat(window.document?.documentElement?.lang, {
    timeStyle: 'short',
  });
}

function createDateFormatter() {
  return new Intl.DateTimeFormat(window.document?.documentElement?.lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function createWeekFormatter() {
  return new Intl.DateTimeFormat(window.document?.documentElement?.lang, {
    weekday: 'long',
  });
}

export const timestampToLocalTime = (ts: string | number) => {
  const formatter = createTimeFormatter();
  return formatter.format(dayjs(ts).toDate());
};

export const timestampToLocalDate = (ts: string | number) => {
  const formatter = createDateFormatter();
  return formatter.format(dayjs(ts).toDate());
};

export interface CalendarTranslation {
  ['com.affine.yesterday'](): string;
  ['com.affine.today'](): string;
  ['com.affine.tomorrow'](): string;
  ['com.affine.nextWeek'](): string;
}

export const timestampToCalendarDate = (
  ts: string | number,
  translation: CalendarTranslation,
  referenceTime?: string | number
) => {
  const startOfDay = dayjs(referenceTime).startOf('d');
  const diff = dayjs(ts).diff(startOfDay, 'd', true);
  const sameElse = timestampToLocalDate(ts);

  const formatter = createWeekFormatter();
  const week = formatter.format(dayjs(ts).toDate());

  return diff < -6
    ? sameElse
    : diff < -1
      ? week
      : diff < 0
        ? translation['com.affine.yesterday']()
        : diff < 1
          ? translation['com.affine.today']()
          : diff < 2
            ? translation['com.affine.tomorrow']()
            : diff < 7
              ? `${translation['com.affine.nextWeek']()} ${week}`
              : sameElse;
};
