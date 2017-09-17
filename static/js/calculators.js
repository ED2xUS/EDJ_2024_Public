// Calculate boluses involving food data
function bolusCalcWFood(mealName){
	// Clear old data
	newBolus = 0;
	newBolusExt = 0;
	newBolusCorr = 0;
	newBolusSuper = 0;
	newBolusCarbs = 0;
	newBolusProtein = 0;
	newBolusFat = 0;
	additionalMessage = '';
	addCarbs = 0;
	totalBolus = 0;
	percentNow = 0;
	percentExt = 0;
	netCarbs = 0;

	// Calculate net carbs
	/*if(mealName == "Breakfast"){
		netCarbs = carbs - (fiber / 2);
	}
	else{*/
		netCarbs = carbs-fiber;
	//}

	// Adjust correction sensitivity at various high BG thresholds

	var nullDataWarn = '';
	if(currBG === undefined){
		currBG = 90;
		nullDataWarn = "<br/>&#x2757 Current BG is undefined.";
	}
	if(currBG>250){
		currSens = currSens*.833;
	}
	else if(currBG>200){
		currSens = currSens*.917;
	}
        else if(currBG>upperBGgoal){
          	newBolusSuper = currBasal; //Super bolus
          	additionalMessage = "Super bolus, wait till bend.";
          	if(protein>20){
            		additionalMessage = "Super bolus, wait till bend if possible.";
          	}
        }
        else if(currBG>middleBGgoal){
          	if((netCarbs>30) || (fat<20)){
			if((prebolus < 10) && (fat<20)){ //Super bolus
				newBolusSuper = currBasal;
				additionalMessage = "Super bolus, wait till bend if possible.";
			}
			else{
				additionalMessage = "Wait till bend if possible.";
			}
			if(prebolus>10){
				additionalMessage = "Wait till bend if possible.";
			}
          	}
          	else{
		  	if(prebolus < 10){
				newBolusSuper = currBasal;
				additionalMessage = "Super bolus if eating immediately.";
			} //Super bolus
          	}
        }
        /*else if(currBG>lowerBGgoal){
          	if(netCarbs>30){
          		if(prebolus < 10){
				newBolusSuper = currBasal;
				additionalMessage = "Super bolus if eating immediately.";
			} //Super bolus
          	}
        }*/
	// Calculate carb and correction base doses
	newBolusCorr = ((currBG-BGgoal)/currSens)-IOBcorr; //Correction
	if((newBolusCorr > 0) && (predictedBGdrop > 0){
			newBolusCorr = newBolusCorr * .7;
	}
	if((newBolusCorr < 0) && (currBG > 75)) { newBolusCorr = 0; }

	// ~~~ OLD ALGORITHM ~~~
	//newBolusCarbs = netCarbs/currCarbRatio; //Carbs
	/*if((netCarbs > 30) && (mealName != "Breakfast")){
		newBolusProtein = (protein/2)/10.0; //Protein
	}
	else{*/
		/*newBolusProtein = ((protein-15)/2.0)/currCarbRatio; //Protein
	//}
	if(newBolusCarbs<0) { newBolusCarbs = 0; }
	if(newBolusProtein<0) { newBolusProtein = 0; }*/
	/*if((fat>20) || (fiber>10)){
        	//newBolusFat = (((fat-20)/2)/currCarbRatio); //Fat
		if(currBG < middleBGgoal){
			newBolusFat = (newBolusCarbs*.25);//+(fat*0.01);
			newBolusCarbs = newBolusCarbs*.75;
			extBolusTime = 120;
		}
		else{
			newBolusFat = (newBolusCarbs*.1);//+(fat*0.01);
			newBolusCarbs = newBolusCarbs*.9;
			extBolusTime = 90;
		}
        }
	console.log("Meal: "+mealName);
	console.log("Carbs grams/dose: "+netCarbs+" / "+newBolusCarbs);
	console.log("Protein grams/dose: "+protein+" / "+newBolusProtein);
	console.log("Fat grams/dose: "+fat+" / "+newBolusFat);
	if(mealName == "Breakfast"){
		newBolusCarbs = newBolusCarbs+newBolusProtein;
		newBolus = newBolusCorr+newBolusSuper+newBolusCarbs;
		newBolusExt = newBolusFat;
	}
	else{
        	newBolus = newBolusCorr+newBolusSuper+newBolusCarbs;
		newBolusExt = newBolusFat+newBolusProtein;
	}*/
	// ~~~ END OLD ALGORITHM ~~~

	// ~~~~~~~~~~~~~~~~~~~ NEW ALGORITHM ~~~~~~~~~~~~~~~~~~~
	var reduceBolusNowBy = 0; // used only for complex meals?
	if(fiber>10){
		if(currBG < middleBGgoal){
			reduceBolusNowBy = 0.2;
		}
        }
	console.log("Meal: "+mealName);
	var CU = (netCarbs/10.0);
        console.log("CU: "+ CU);
	var newProtein = (protein-20);
	if(newProtein < 0){ newProtein = 0; }
	var newFat = (fat-20);
	if(newFat < 0){ newFat = 0; }
	var origFPU = (protein*4.0+fat*9.0)/100.0;
	var FPU = ((newProtein*4.0+newFat*9.0)/100.0)*.8;
				console.log("Original FPU: "+ origFPU);
				console.log("Modified FPU: "+ FPU);
        var IRFactor = (10.0/currCarbRatio);
        //console.log("IRFactor: "+ IRFactor);
        var CDI = (CU + origFPU) * IRFactor;
        //console.log("CDI: "+ CDI);
        var CU_perc = CU / (CU + origFPU);
        //console.log("CU_perc: "+ CU_perc);
        console.log("Correction: "+ newBolusCorr);
        if (CU_perc < 0.2) { newBolusCarbs = 0; }
        else if (CU_perc >= 0.2 && CU_perc <= 0.8) { newBolusCarbs = CU * IRFactor * (1 - reduceBolusNowBy); }
        else { newBolusCarbs = CU * IRFactor; }
        console.log("Bolus now: "+ newBolusCarbs);
        if ((origFPU < 1.0) || ((origFPU >= 1.0) && (CU_perc > 0.8))) { newBolusExt = 0; }
        else if ((origFPU >= 1.0) && (CU_perc < 0.2)) { newBolusExt = FPU * IRFactor; }
        else if ((origFPU >= 1.0) && (CU_perc >= 0.2) && (CU_perc <= 0.8) ) { newBolusExt = FPU * IRFactor * (1 + reduceBolusNowBy); }
        console.log("Extended bolus: "+ newBolusExt);
        if ((origFPU < 1.0) || (CU_perc > 0.8)) { extBolusTime = 0; }
        else if ((origFPU >= 1.0) && (origFPU < 2.0)) { extBolusTime = 120; } // modified from recommended 180 minutes
        else if ((origFPU >= 2.0) && (origFPU < 3.0)) { extBolusTime = 180; } // modified from recommended 240 minutes
        else if ((origFPU >= 3.0) && (origFPU < 4.0)) { extBolusTime = 240; } // modified from recommended 300 minutes
        else { extBolusTime = 300; } // modified from recommended 480 minutes
	console.log("Extended bolus time: "+ (extBolusTime/60.0).toFixed(1) +" hours");
	// ***Refactor percentages for complex meals
	if((newFat == 0) && (newProtein > 0) && (netCarbs < 10)){
		newBolusCarbs = newBolusCarbs + newBolusExt;
		newBolusExt = 0;
	}
	else if((newFat > 0) && (newProtein > 0) && (netCarbs < 10)){
		newBolusCarbs = newBolusCarbs + newBolusExt*.2;
		newBolusExt = newBolusExt*.8;
	}

	// ~~~~~~~~~~~~~~~~~~~ END NEW ALGORITHM ~~~~~~~~~~~~~~~~~~~
	var newBolusExtAdj = newBolusExt;
	newBolus = newBolusCarbs+newBolusSuper+newBolusCorr;
	if(predictedBGdrop > 0){
		 newBolusExtAdj -= .7*(predictedBGdrop/currSens);
		 newBolus -= .3*(predictedBGdrop/currSens);
		 if(newBolusExtAdj < 0){
				newBolus += newBolusExtAdj;
		 }
	}
	else{
		if(newBolus < 0){ // correction is greater than bolus now
			newBolus = newBolusCarbs + newBolusSuper;
			newBolusExtAdj = newBolusExtAdj + newBolusCorr;
		}
	}
	if(newBolus < 0) { newBolus = 0; }
	if(newBolusExtAdj < 0) { newBolusExt = 0; newBolusExtAdj = 0; extBolusTime = 0;}
	totalBolus = newBolus + newBolusExtAdj;
	if(totalBolus < 0) { totalBolus = 0; }
        percentExt = Math.round((newBolusExtAdj/totalBolus)*100);
        percentNow = 100-percentExt; //((newBolusExt/totalBolus)*100);
	// Accomodate upcoming exercise
	addCarbs = (75-currBG)/(currSens/currCarbRatio)-carbs;
	if(predictedBGdrop > 0){
		addCarbs += predictedBGdrop/(currSens/currCarbRatio);
	}
  console.log("Add carbs: "+addCarbs);
	if(addCarbs >= 0.5){
        	document.getElementById("results_meal").innerHTML = "<br/>Need more carbs! Eat "+addCarbs.toFixed(0)+"g more. &#x1F36C"+nullDataWarn;
	}
	var extBolusText = '';
	var extBolusTimeText = (extBolusTime/60.0).toFixed(1);
	if(newBolusExtAdj > 0){
		extBolusText = " ("+percentNow.toFixed(0)+"% / "+percentExt.toFixed(0)+"%)<br/>"+newBolus.toFixed(2)+" + "+newBolusExtAdj.toFixed(2)+" extended over "+extBolusTimeText+" hour(s). ";
	}
	else{ extBolusText = ". "; extBolusTime = "N/A"; }

        document.getElementById("results_meal").innerHTML += "<br/>Recommended bolus: "
		+ totalBolus.toFixed(2)+ extBolusText + additionalMessage + nullDataWarn;
	$("#results_mealdose").show();
	document.getElementById("carbdose_meal").value = newBolusCarbs.toFixed(2);
	document.getElementById("extdose_meal").value = newBolusExt.toFixed(2);
	document.getElementById("corrdose_meal").value = newBolusCorr.toFixed(2);
	document.getElementById("super_meal").value = newBolusSuper.toFixed(2);
	document.getElementById("bolusnow_meal").value = percentNow.toFixed(0);
	document.getElementById("bolusext_meal").value = percentExt.toFixed(0);
	document.getElementById("extBolusTime").value = extBolusTime;
} // end bolusCalcWFood

// Calculate boluses for corrections only
function bolusCalc(){
      	newBolus = 0;
      	newBolusCorr = 0;
      	newBolusSuper = 0;
      	additionalMessage = '';
        addCarbs = 0;
	var nullDataWarn = '';
	if(currBG === undefined){
		currBG = 90;
		nullDataWarn = "<br/>&#x2757 Current BG is undefined.";
	}
	if(currBG>250){
		currSens = currSens*.833;
	}
	else if(currBG>200){
		currSens = currSens*.917;
	}
	newBolusCorr = ((currBG-BGgoal)/currSens)-IOBcorr; //Correction
	if((newBolusCorr < 0) && (currBG > 75)) { newBolusCorr = 0; }
        if(currBG>upperBGgoal){
          	newBolusSuper = currBasal; //Correction + Super bolus
          	additionalMessage = "Add super bolus."
        }
        newBolus = newBolusCorr + newBolusSuper;
	var divToWriteTo = 'results_correction';
        if(newBolus<0){
        	addCarbs = (75-currBG)/(currSens/currCarbRatio);
					if(predictedBGdrop > 0){
						addCarbs += predictedBGdrop/(currSens/currCarbRatio);
					}
		if(addCarbs < 0){ addCarbs = 0; }
		if(addCarbs < 0.5) { document.getElementById(divToWriteTo).innerHTML = "<br/>No correction needed!"+nullDataWarn; }
		else { document.getElementById(divToWriteTo).innerHTML = "<br/>Need more carbs! Eat "+addCarbs.toFixed(0)+"g. &#x1F36C"+nullDataWarn; }
		document.getElementById("corrCarbs").value = addCarbs.toFixed(0);
		document.getElementById("corrdose").value = 0;
        }
        else if (newBolus<0.1){
	  	document.getElementById(divToWriteTo).innerHTML = "<br/>No correction needed!"+nullDataWarn;
		document.getElementById("corrCarbs").value = 0;
          	document.getElementById("corrdose").value = 0;
        }
        else{
	  	document.getElementById("corrCarbs").value = 0;
		document.getElementById(divToWriteTo).innerHTML = "<br/>Recommended bolus: "+newBolus.toFixed(2)+". "+ additionalMessage +"<br/>Correction: "+newBolusCorr.toFixed(2)+"<br/>Super: "+newBolusSuper.toFixed(2)+nullDataWarn;
	  	document.getElementById("corrdose").value = newBolus.toFixed(2);
        }
} // bolusCalc

// Bolus calc handler
function calcFoodBolus(mealOrSnack, name){
	resetVars();
	eventType = mealOrSnack+" Bolus";
	prebolus = document.getElementById("prebolus").value;
	getMealData(name, function(data){
		if (data != "<br/>No meal data available."){
		      	document.getElementById("carbs").value = carbs;
		      	document.getElementById("fat").value = fat;
		      	document.getElementById("protein").value = protein;
		      	document.getElementById("fiber").value = fiber;
		      	bolusCalcWFood(name);
	      	}
	      	else{
		    	document.getElementById("errors").innerHTML = "Couldn't get meal results";
	      	}
	});
} // end calcFoodBolus
