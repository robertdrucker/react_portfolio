export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result)
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  else {
    return null;
  }
};

export const getIncPosOnlyData = (yMin, yMax, numDataRows) => {
  let inc1;
  let inc2;
  let inc;

  let highRows = Math.floor((numDataRows - 1) / 2);
  let lowRows = Math.ceil((numDataRows - 1) / 2);
  let numIncrements = numDataRows - 1;

  if (yMax > 0 && yMin < 0 && yMax >= Math.abs(yMin)) {
    if (Math.abs(yMax) % highRows === 0) {
      inc1 = yMax / highRows;
    } else {
      inc1 = (yMax - (yMax % highRows) + highRows) / highRows;
    }
    if (Math.abs(yMin) % lowRows === 0) {
      inc2 = Math.abs(yMin) / lowRows;
    } else {
      inc2 = (Math.abs(yMin) - (Math.abs(yMin) % lowRows) + lowRows) / lowRows;
    }
    inc = inc1 >= inc2 ? inc1 : inc2;
  } else if (yMax > 0 && yMin < 0 && Math.abs(yMin) > yMax) {
    if (
      -0.0001 <= Math.abs(yMin) % highRows &&
      Math.abs(yMin) % highRows <= 0.0001
    ) {
      inc1 = Math.abs(yMin) / highRows;
    } else {
      inc1 =
        (Math.abs(yMin) - (Math.abs(yMin) % highRows) + highRows) / highRows;
    }
    if (
      -0.0001 <= Math.abs(yMin) % lowRows &&
      Math.abs(yMin) % lowRows <= 0.0001
    ) {
      inc2 = yMax / lowRows;
    } else {
      inc2 = (yMax - (yMax % lowRows) + lowRows) / lowRows;
    }
    inc = inc1 >= inc2 ? inc1 : inc2;
  }
  // All negative numbers
  if (yMax <= 0 && yMin < 0) {
    if (Math.abs(yMin) % numIncrements === 0) {
      inc = Math.abs(yMin) / numIncrements;
    } else {
      inc =
        (Math.abs(yMin) - (Math.abs(yMin) % numIncrements) + numIncrements) /
        numIncrements;
    }
  } else {
    // All positive numbers (3 cases)
    if (yMin >= 0 && yMax !== 0 && yMax % numIncrements === 0) {
      inc = yMax / numIncrements;
    } else if (yMin >= 0 && yMax !== 0) {
      inc = (yMax - (yMax % numIncrements) + numIncrements) / numIncrements;
    } else if (yMin === 0 && yMax === 0) {
      inc = 1; // case if yMin = 0 and yMax = 0
    }
  }

  // Return pleasing increment number (177 to 180, etc.)
  if (inc < 10) {
    return Math.ceil(inc / 1) * 1;
  } else if (inc < 100) {
    return Math.ceil(inc / 10) * 10;
  } else if (inc < 1000) {
    return Math.ceil(inc / 100) * 100;
  } else if (inc < 10000) {
    return Math.ceil(inc / 1000) * 1000;
  } else if (inc < 100000) {
    return Math.ceil(inc / 10000) * 10000;
  } else if (inc < 1000000) {
    return Math.ceil(inc / 100000) * 100000;
  } else {
    return inc;
  }
};
