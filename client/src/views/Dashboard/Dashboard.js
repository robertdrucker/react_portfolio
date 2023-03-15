import React from "react";
import LineGraph from "../../components/LineGraph/LineGraph";
import { data1, dataMultiSeriesLine } from "../../components/LineGraph/data";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <LineGraph
        data={data1}
        title={"Graph Title"}
        showFullSize={false}
        yAxisTitle={"Total"}
        xAxisTitle={"Date"}
      />
      <LineGraph
        data={data1}
        title={"Graph Title"}
        showFullSize={true}
        yAxisTitle={"Total"}
        xAxisTitle={"Date"}
      />
      <LineGraph
        title={"JFC Pharmacies"}
        data={dataMultiSeriesLine}
        showFullSize={false}
      />
    </div>
  );
};

export default Dashboard;
