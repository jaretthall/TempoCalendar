// ... (keep imports)

// Update the renderShift function in MonthView component:
const renderShift = (shift: Shift, index: number) => {
  const provider = getProvider(shift.providerId);
  const clinicType = getClinicType(shift.clinicTypeId);
  
  // Don't render vacation shifts here - they'll be shown in the vacation bar
  if (shift.isVacation) return null;

  const tooltip = `${provider?.name} - ${clinicType?.name}`;
  
  return (
    <div
      key={`${shift.id}-${index}`}
      className="calendar-shift"
      style={{ backgroundColor: provider?.color }}
      data-tooltip={tooltip}
      onClick={(e) => {
        e.stopPropagation();
        onShiftClick(shift);
      }}
    />
  );
};

// Update the renderDay function:
const renderDay = (day: Date, index: number) => {
  const isCurrentMonth = isSameMonth(day, viewDate);
  const isCurrentDay = isToday(day);
  const shiftsForDay = getShiftsForDate(day);
  const vacationProviders = getVacationProviders(shifts, providers, day);
  
  return (
    <div
      key={index}
      className={cn(
        "calendar-cell",
        !isCurrentMonth && "calendar-cell-other-month",
        isCurrentDay && "calendar-cell-today"
      )}
      onClick={() => onAddShift(day)}
    >
      <span className="calendar-day-number">
        {format(day, "d")}
      </span>
      
      <div className="calendar-shifts-grid">
        {shiftsForDay
          .filter(shift => !shift.isVacation)
          .map((shift, idx) => renderShift(shift, idx))}
      </div>
      
      {vacationProviders.length > 0 && (
        <div className="calendar-vacation-bar">
          {vacationProviders.join(", ")}
        </div>
      )}
    </div>
  );
};

// ... (keep rest of the file)