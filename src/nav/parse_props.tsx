export const parseProps = ({
  now,
  time: time,
  setTime: setTime,
}: {
  now?: Date;
  time?: Date;
  setTime?: (newTime: Date) => void;
}) => {
  return {
    now: now ?? new Date(),
    time: time ?? new Date(),
    setTime: setTime,
  };
};
