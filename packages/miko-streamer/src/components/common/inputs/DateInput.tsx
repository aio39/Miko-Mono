import {
  Box,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import convertDate from '@src/helper/convertDate';
import { FC, useEffect, useState } from 'react';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import { Calendar, DayValue, Locale } from 'react-modern-calendar-datepicker';

const DateInputWrapper: FC<{
  registerReturn: UseFormRegisterReturn;
  setValue: UseFormSetValue<any>;
}> = ({ registerReturn, setValue }) => {
  const { name } = registerReturn;

  const [viewingDate, setViewingDate] = useState<string>(convertDate(new Date(), 'YMDHM'));

  const [calendarState, setCalendarState] = useState<DayValue>();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!calendarState) return;
    const { day, month, year } = calendarState;
    const monthIndex = month - 1;
    const date = new Date(year, monthIndex, day, hours, minutes);

    const timestamp = date.getTime();
    setValue(name, timestamp);
    setViewingDate(convertDate(timestamp, 'YMDHM'));
  }, [calendarState, hours, minutes, name, setValue]);

  return (
    <Box>
      <Popover placement="bottom" variant="responsive">
        {/* @ts-ignore */}
        <PopoverTrigger>
          <Text>{viewingDate}</Text>
        </PopoverTrigger>
        <PopoverContent width="auto">
          <PopoverArrow />
          <PopoverCloseButton />
          {/* <PopoverHeader>Confirmation!</PopoverHeader> */}
          <PopoverBody display="flex" flexDirection="row" justifyContent="center" alignItems="center">
            <Box width="600px">
              <Calendar
                // onChange={(e) => {
                //   console.log(e);
                // }}
                // calendarClassName="custom-calendar"\
                value={calendarState}
                onChange={setCalendarState}
                locale={myCustomLocale}
                colorPrimary="#39c5bb"
                shouldHighlightWeekends
              />
            </Box>
            <Box width="300px">
              <NumberInput
                defaultValue={0}
                value={hours}
                onChange={value => {
                  setHours(parseInt(value));
                }}
                min={0}
                max={23}
                step={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumberInput
                defaultValue={0}
                value={minutes}
                onChange={value => {
                  setMinutes(parseInt(value));
                }}
                min={0}
                max={59}
                step={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default DateInputWrapper;

const myCustomLocale: Locale = {
  // months list by order
  months: ['1???', '2???', '3???', '4???', '5???', '6???', '7???', '8???', '9???', '10???', '11???', '12???'],

  // week days by order
  weekDays: [
    {
      name: 'Sunday', // used for accessibility
      short: 'S', // displayed at the top of days' rows
      isWeekend: true, // is it a formal weekend or not?
    },
    {
      name: 'Monday',
      short: 'M',
    },
    {
      name: 'Tuesday',
      short: 'T',
    },
    {
      name: 'Wednesday',
      short: 'W',
    },
    {
      name: 'Thursday',
      short: 'T',
    },
    {
      name: 'Friday',
      short: 'F',
    },
    {
      name: 'Saturday',
      short: 'S',
      isWeekend: true,
    },
  ],

  // just play around with this number between 0 and 6
  weekStartingIndex: 0,

  // return a { year: number, month: number, day: number } object
  getToday(gregorainTodayObject) {
    return gregorainTodayObject;
  },

  // return a native JavaScript date here
  toNativeDate(date) {
    return new Date(date.year, date.month - 1, date.day);
  },

  // return a number for date's month length
  getMonthLength(date) {
    return new Date(date.year, date.month, 0).getDate();
  },

  // return a transformed digit to your locale
  transformDigit(digit) {
    return digit;
  },

  // texts in the date picker
  nextMonth: '?????? ???',
  previousMonth: '??? ???',
  openMonthSelector: '??? ??????',
  openYearSelector: '?????? ??????',
  closeMonthSelector: '??? ?????? ??????',
  closeYearSelector: '?????? ?????? ??????',
  defaultPlaceholder: '??????...',

  // for input range value
  from: 'from',
  to: 'to',

  // used for input value when multi dates are selected
  digitSeparator: ',',

  // if your provide -2 for example, year will be 2 digited
  yearLetterSkip: 0,

  // is your language rtl or ltr?
  isRtl: false,
};
