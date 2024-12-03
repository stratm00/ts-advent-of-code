import fs from "node:fs"; 

type ReportData = number[]; 
const ACCEPTABLE_DELTA_BOUNDS = [1,3];

fs.readFile("./2/input.txt", (err, data)=>{
    if(err){
        console.error(err);
        return;
    }
    let reports: ReportData[] = [];
    const dataString = data.toString();

    for (const reportString of dataString.split("\n")){
        if(reportString!==""){
            reports.push( reportString.split(" ").map(Number) );
        }
    }

    const numberOfSafeReports = reports.filter((rep)=>isReportSafe(rep)).length;

    console.log(`Es gab ${numberOfSafeReports} sichere Reports.`)
});

function isReportSafe(report:ReportData):boolean {
    let reportIsSafe = isReportSafeUndampened(report)

    //omit one element of the array to simulate dampening, and OR the Safety of that to the current reportIsSafe
    for(const index in report){
        //Don't believe JS Array's indexing lies
        const num_index = Number(index);
        let dampenedReport: ReportData = [];

        if(num_index==0){
            dampenedReport = report.slice(1, report.length);
        }else if (num_index==report.length-1){
            dampenedReport = report.slice(0, report.length-1);
        }else{
            dampenedReport = report.slice(0,num_index);
            dampenedReport.push(...report.slice(num_index+1, report.length))
        }
        
        reportIsSafe = reportIsSafe || isReportSafeUndampened(dampenedReport);
        
    }

    return reportIsSafe
}

function isReportSafeUndampened(report:ReportData):boolean {
    let monotonous_falling_action = true;
    let monotonous_rising_action = true;
    let action_in_acceptable_deltas = true;

    //Naive solution
    for(const index in report){
        //JS Array indices are Strings, fun things happen when you use expressions like index+1
        const num_index = Number(index)
        if(num_index< report.length-1){
            let delta_nums = report[num_index]-report[num_index+1];

            if(delta_nums<0){
                monotonous_falling_action = false;
            }else if(delta_nums>0){
                monotonous_rising_action = false;
            }

            const abs_delta = Math.abs(delta_nums)
            action_in_acceptable_deltas = action_in_acceptable_deltas && ( (abs_delta>=ACCEPTABLE_DELTA_BOUNDS[0]) && (abs_delta<=ACCEPTABLE_DELTA_BOUNDS[1]));
        }
    }
    
    return ((monotonous_rising_action || monotonous_falling_action) && action_in_acceptable_deltas)
    
}
