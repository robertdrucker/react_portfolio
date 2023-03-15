import React, { useEffect, useState, useRef } from "react";
import { hexToRgb, getIncPosOnlyData } from "./LineGraphFunctions";
import { ReactComponent as CloseIcon } from "../../assets/x.svg";
import styles from "./LineGraph.module.css";

const LineGraph = ({ data, title, showFullSize, yAxisTitle, xAxisTitle }) => {
  let displayData = data[0].displayData;

  const canvas = useRef();
  const [legendsGroupWidth, setLegendsGroupWidth] = useState(0);
  const [error, setError] = useState(false);

  let numYAxisIntervals = showFullSize ? 10 : 5;

  let xAxisLabels = [];
  let xAxisDataIntervalPixels;

  let graphContainerHeightPixels = showFullSize ? 684 : 380;

  // distance (pixels) between top horizonal line and bottom horizonal line
  let graphHeightPixels = showFullSize
    ? 0.712 * graphContainerHeightPixels
    : 0.566 * graphContainerHeightPixels; // gap (pixels) between horizontal lines and y-axis labels
  let canvasHeightPixels = showFullSize
    ? 0.833 * graphContainerHeightPixels
    : 0.782 * graphContainerHeightPixels;
  let canvasWidthPixels;
  let maxCanvasWidthPixelsNoScroll = showFullSize ? 930 : 330;
  let yAxisIntervalPixels;
  let dataShiftToRightPixels = showFullSize ? 46 : 48;
  let minYAxisLabelValue;
  let maxYAxisLabelValue;
  let numIncsYAxis;
  let yAxisRange;
  let gradientProportionalityConstant = 0.82; // controls rate of gradient change down y axis

  let minYDataValue = Infinity;
  let maxYDataValue = -Infinity;

  let dataType; // multi-series or 1-series

  let minGapBetweenXAxisLabelsPixels = showFullSize ? 12.5 : 11; // minimum gap length (pixels) between labels
  let pixelsPerChar = 6; // estimated average width in pixels per character
  let numDataSets = 0;
  let totalCharLengthXAxisLabels = 0;
  let labelCharLengths = [];
  let xAxisDataIntervalsPixels = [];
  let totalxAxisDataIntervalsPixels = [];
  let avgXDataIntervalPixels;

  try {
    if (!error) {
      if (data && data.length >= 1 && data[0].name) {
        dataType = "multi-series";
      } else if (data && data.length === 1 && !data[0].name) {
        dataType = "1-series";
      } else {
        setError(true);
        if (Array.isArray(data) && data?.length === 0) {
          throw new Error(
            "No data were retrieved for the selected date range."
          );
        } else {
          throw new Error("There is an issue with the data format.");
        }
      }

      data[0].data.forEach((xyObj) => {
        totalCharLengthXAxisLabels += xyObj.x.length;
        labelCharLengths.push(xyObj.x.length);
        numDataSets += 1;
      });

      let scrollAreaWidth = maxCanvasWidthPixelsNoScroll;

      let gapBetweenXAxisLabelsPixels =
        (scrollAreaWidth -
          (dataShiftToRightPixels +
            totalCharLengthXAxisLabels * pixelsPerChar)) /
        (numDataSets - 1);

      if (gapBetweenXAxisLabelsPixels < minGapBetweenXAxisLabelsPixels) {
        gapBetweenXAxisLabelsPixels = minGapBetweenXAxisLabelsPixels; // minimum gap between labels allowed
      }

      data[0].data.forEach((xyObj) => {
        if (numDataSets < data[0].data.length - 1) {
          xAxisDataIntervalsPixels.push(
            gapBetweenXAxisLabelsPixels + xyObj.x.length * pixelsPerChar
          );
        } else {
          xAxisDataIntervalsPixels.push(
            gapBetweenXAxisLabelsPixels + xyObj.x.length * pixelsPerChar
          );
        }
      });

      xAxisDataIntervalsPixels.forEach((value, index) => {
        if (index === 0) {
          totalxAxisDataIntervalsPixels.push(0);
        } else if (index === 1) {
          totalxAxisDataIntervalsPixels.push(xAxisDataIntervalsPixels[0]);
        } else {
          let sum = 0;
          for (let i = 0; i < index; i++) {
            sum += xAxisDataIntervalsPixels[i];
          }

          totalxAxisDataIntervalsPixels.push(sum);
        }
      });

      avgXDataIntervalPixels =
        (totalCharLengthXAxisLabels / numDataSets) * pixelsPerChar +
        gapBetweenXAxisLabelsPixels;

      xAxisDataIntervalPixels = avgXDataIntervalPixels;

      yAxisIntervalPixels = graphHeightPixels / numYAxisIntervals;

      // Change canvas width if scroll is necessary
      if (gapBetweenXAxisLabelsPixels > minGapBetweenXAxisLabelsPixels) {
        canvasWidthPixels = maxCanvasWidthPixelsNoScroll;
      } else {
        canvasWidthPixels =
          totalxAxisDataIntervalsPixels[
            totalxAxisDataIntervalsPixels.length - 1
          ] + 88;
      }

      data.forEach((obj) => {
        for (var j = 0; j < obj.data.length; j += 1) {
          if (!obj.data[j] || (!obj.data[j].y && obj.data[j].y !== 0)) {
            setError(true);
            throw new Error("Missing 'y' Data.");
          }

          if (obj.data[j].y < minYDataValue) {
            minYDataValue = obj.data[j].y;
          }
          if (obj.data[j].y > maxYDataValue) {
            maxYDataValue = obj.data[j].y;
          }
        }
      });

      let highRows = Math.floor(numYAxisIntervals / 2);
      let lowRows = Math.ceil(numYAxisIntervals / 2);
      let numIncrements = numYAxisIntervals;

      numIncsYAxis = getIncPosOnlyData(
        minYDataValue,
        maxYDataValue,
        numYAxisIntervals + 1
      );

      if (maxYDataValue >= Math.abs(minYDataValue) && minYDataValue < 0) {
        minYAxisLabelValue = -lowRows * numIncsYAxis;
      } else if (
        maxYDataValue > 0 &&
        maxYDataValue < Math.abs(minYDataValue) &&
        minYDataValue < 0
      ) {
        minYAxisLabelValue = -highRows * numIncsYAxis;
      } else if (maxYDataValue <= 0 && minYDataValue < 0) {
        minYAxisLabelValue = -numIncrements * numIncsYAxis;
      } else {
        minYAxisLabelValue = 0;
      }

      maxYAxisLabelValue =
        minYAxisLabelValue + numIncsYAxis * numYAxisIntervals;

      yAxisRange = maxYAxisLabelValue - minYAxisLabelValue;
    }
  } catch (err) {
    setError(err.message);
  }

  useEffect(() => {
    // Creates the graphs in canvas
    if (!error) {
      try {
        // Create a drawing object

        const ctx = canvas.current.getContext("2d");
        ctx.reset();

        ctx.translate(0, 5);

        // Create horizontal dashed lines
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = "#D9E1EC";
        ctx.setLineDash([2, 4]); //dashes are 2px and spaces are 4px

        /*********************************************************************/
        let yPosition = 0; // bottom of canvas
        /*********************************************************************/

        ctx.beginPath();

        for (var i = 0; i < numYAxisIntervals + 1; i += 1) {
          ctx.moveTo(dataShiftToRightPixels, yPosition);
          ctx.lineTo(canvasWidthPixels - 10, yPosition);

          ctx.stroke();
          yPosition += yAxisIntervalPixels;
        }

        // Make upcoming lines solid
        ctx.setLineDash([]);

        for (i = 0; i < data.length; i += 1) {
          if (!data[i].color) {
            throw new Error("Color not specified.");
          }
          ctx.fillStyle = data[i].color;
          let x = dataShiftToRightPixels;
          let y;

          // Plot ellipses and create xAxisLabels array
          for (var j = 0; j < data[i].data.length; j += 1) {
            if (displayData) {
              y = data[i].data[j].y;
              ctx.beginPath();

              let radiusX, radiusY;

              if (dataType === "multi-series") {
                radiusX = 5;
                radiusY = 5;
              } else {
                radiusX = 3;
                radiusY = 3;
              }

              ctx.ellipse(
                x,
                graphHeightPixels -
                  graphHeightPixels * ((y - minYAxisLabelValue) / yAxisRange),
                radiusX,
                radiusY,
                Math.PI / 4,
                0,
                2 * Math.PI
              );
              ctx.fill();
            }

            x += xAxisDataIntervalsPixels[j];
            if (
              data[i] &&
              data[i].data[j] &&
              data[i].data[j].x &&
              xAxisLabels.length === j
            ) {
              xAxisLabels.push(data[0].data[j].x);
            } else if (!(data[i] && data[i].data[j] && data[i].data[j].x)) {
              setError(true);
              throw new Error("Missing 'x' label.");
            }
          }

          if (dataType === "multi-series") {
            // draw data lines
            x = xAxisDataIntervalPixels + dataShiftToRightPixels;
            ctx.strokeStyle = data[i].color;
            ctx.lineWidth = 2.2; // used for all paths

            ctx.moveTo(
              dataShiftToRightPixels,
              graphHeightPixels -
                graphHeightPixels *
                  ((data[i].data[0].y - minYAxisLabelValue) / yAxisRange)
            );
            for (j = 1; j < data[i].data.length; j += 1) {
              y = data[i].data[j].y;
              ctx.lineTo(
                x,
                graphHeightPixels -
                  graphHeightPixels * ((y - minYAxisLabelValue) / yAxisRange)
              );
              x += xAxisDataIntervalsPixels[j];
              ctx.stroke();
            }
          } else if (displayData && dataType === "1-series") {
            var grd = ctx.createLinearGradient(
              0,
              0,
              0,
              gradientProportionalityConstant * graphHeightPixels // controls rate of gradient change down y axis
            );

            const rgbObject = hexToRgb(data[i].color);
            const r = rgbObject.r;
            const g = rgbObject.g;
            const b = rgbObject.b;

            const colorStop0 = `rgba(${r}, ${g}, ${b}, 0.3)`;
            const colorStop1 = `rgba(${r}, ${g}, ${b}, 0.02)`;

            grd.addColorStop(0, colorStop0);
            grd.addColorStop(1, colorStop1);
            ctx.strokeStyle = data[i].color;
            ctx.fillStyle = grd;
            ctx.lineWidth = 2;
            ctx.beginPath();

            ctx.moveTo(
              dataShiftToRightPixels,
              graphHeightPixels -
                graphHeightPixels *
                  ((data[i].data[0].y - minYAxisLabelValue) / yAxisRange)
            );

            x = xAxisDataIntervalsPixels[0] + dataShiftToRightPixels;

            for (j = 1; j < data[i].data.length; j += 1) {
              y = data[i].data[j].y;
              ctx.lineTo(
                x,
                graphHeightPixels -
                  graphHeightPixels * ((y - minYAxisLabelValue) / yAxisRange)
              );
              x += xAxisDataIntervalsPixels[j];
            }

            ctx.stroke();

            ctx.lineTo(
              dataShiftToRightPixels +
                totalxAxisDataIntervalsPixels[
                  totalxAxisDataIntervalsPixels.length - 1
                ],
              graphHeightPixels // Control gradient fill height here
            );
            ctx.lineTo(dataShiftToRightPixels, graphHeightPixels * 1);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Plot horizontal labels
        ctx.font = "10px Poppins";
        ctx.fillStyle = "#454B60";
        if (dataType === "multi-series") {
          xAxisLabels.forEach((label, i) => {
            ctx.fillText(
              label,
              dataShiftToRightPixels + totalxAxisDataIntervalsPixels[i] - 8,
              showFullSize ? graphHeightPixels + 28 : graphHeightPixels + 26
            );
          });
        } else if (dataType === "1-series") {
          xAxisLabels.forEach((label, i) => {
            ctx.fillText(
              label,
              dataShiftToRightPixels + totalxAxisDataIntervalsPixels[i] - 8,
              showFullSize ? graphHeightPixels + 28 : graphHeightPixels + 26
            );
          });
        }

        if (dataType === "multi-series") {
          // Plot legends & names
          // Get total number of characters in legend names
          let numChars = 0;
          data.forEach((obj) => {
            numChars += obj.name.length;
          });

          // numChars is an experimentally-determined constant and depends upon font-size
          // numChars is the total number of characters (numIncsYAxisluding blanks) in the legend names
          // 10 is 10px legend symbol width
          // 7 is 7px right margin after each legend symbol
          // 16 is 16 px right margin after all but last legend name
          setLegendsGroupWidth(
            numChars * numChars +
              data.length * (10 + 7) +
              (data.length - 1) * 16
          );
        }
      } catch (err) {
        setError(err.message);
      }
    }
  }, [data, showFullSize]);

  // const handleClose = (e) => {
  //   e.stopPropagation();
  // };

  const DisplayGraphs = (
    <div
      className={
        showFullSize
          ? `${styles.graphContainer} ${styles["graphContainer--fullSize"]}`
          : styles.graphContainer
      }
      style={{ height: graphContainerHeightPixels }}
    >
      <h1
        className={
          showFullSize
            ? `${styles.title} ${styles["title--fullSize"]}`
            : styles.title
        }
      >
        {title}
      </h1>
      <div
        className={
          showFullSize
            ? `${styles.yAxisLabelsGroup} ${styles["yAxisLabelsGroup--fullSize"]}`
            : styles.yAxisLabelsGroup
        }
      >
        <div className={styles.yAxisTitle}>{yAxisTitle}</div>
        <div
          className={
            showFullSize
              ? `${styles.yAxisLabels} ${styles["yAxisLabels--fullSize"]}`
              : styles.yAxisLabels
          }
        >
          {Array.apply(null, Array(numYAxisIntervals + 1)).map(
            (nullParameter, index) => {
              let yLabelValue;

              if (
                minYAxisLabelValue +
                  numIncsYAxis * (numYAxisIntervals - index) >=
                  1000 ||
                Math.abs(minYAxisLabelValue) -
                  numIncsYAxis * (numYAxisIntervals - index) >=
                  1000
              ) {
                yLabelValue = `${
                  (minYAxisLabelValue +
                    numIncsYAxis * (numYAxisIntervals - index)) /
                  1000
                }k`;
              } else {
                yLabelValue =
                  minYAxisLabelValue +
                  numIncsYAxis * (numYAxisIntervals - index);
              }

              return (
                <span
                  key={index}
                  style={
                    index !== numYAxisIntervals
                      ? {
                          height: showFullSize
                            ? graphHeightPixels / numYAxisIntervals
                            : graphHeightPixels / numYAxisIntervals,
                        }
                      : null
                  }
                  className={styles.yAxisLabel}
                >
                  {yLabelValue}
                </span>
              );
            }
          )}
        </div>
      </div>

      <div
        className={
          showFullSize
            ? `${styles.scrollAreaLG} ${styles["scrollAreaLG--fullSize"]}`
            : dataType === "multi-series"
            ? `${styles.scrollAreaLG} ${styles["scrollAreaLG--multiSeries"]}`
            : styles.scrollAreaLG
        }
      >
        {
          // Graph legends
          dataType === "multi-series" && (
            <div className={styles.legends}>
              {data.map((obj, index) => {
                return (
                  <div key={index}>
                    <span
                      style={{
                        backgroundColor: obj.color,
                        border: `1px solid ${obj.color}`,
                        borderRadius: "50%",
                        marginLeft: "10px",
                      }}
                      className={styles.legendSymbol}
                    ></span>
                    <span
                      style={
                        index !== data.length - 1
                          ? { marginRight: "16px" }
                          : { marginRight: 0 }
                      }
                      className={styles.legend}
                    >
                      {obj.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        }
        <canvas
          ref={canvas}
          style={{ width: canvasWidthPixels }}
          className={
            showFullSize
              ? `${styles.canvas} ${styles["canvas--fullSize"]}`
              : dataType === "multi-series"
              ? `${styles.canvas} ${styles["canvas--multiSeries"]}`
              : styles.canvas
          }
          width={canvasWidthPixels}
          height={canvasHeightPixels}
          id="canvas"
        />
      </div>
      {!displayData && (
        <p
          className={
            showFullSize
              ? `${styles.noDataMessage} ${styles["noDataMessage--fullSize"]}`
              : styles.noDataMessage
          }
        >
          No data found
        </p>
      )}
      {showFullSize && (
        <div className={styles.closeIconContainer}>
          <CloseIcon fill={"#121A2D"} style={{ cursor: "pointer" }} />
        </div>
      )}
      <div
        className={
          showFullSize
            ? `${styles.xAxisTitle} {styles["xAxisTitle--fullSize"]}`
            : styles.xAxisTitle
        }
      >
        {xAxisTitle}
      </div>
    </div>
  );

  return !error ? (
    DisplayGraphs
  ) : (
    <div className={styles.errMsgContainer}>
      <p className={styles.errorMsg}>Unable to create graph.</p>
      <p className={styles.errorMsg}>{error}</p>
    </div>
  );
};
export default LineGraph;
