# ⚡ Electricity Consumption Analyzer

### Understand Your Electricity Usage. Reduce Wastage. Save Energy.

## 📌 About the Project

The Electricity Consumption Analyzer is a web application designed to help users understand how much electricity individual appliances consume and how that usage contributes to their estimated electricity costs.

The application allows users to enter appliance details, analyze energy consumption, estimate electricity expenses, and receive practical recommendations to reduce unnecessary electricity usage.

The project focuses on improving energy awareness through simple, interactive, and data-driven analysis.

## 🎯 Problem Statement

Many electricity consumers are unaware of how much electricity individual appliances consume and which appliances contribute most to their overall usage. Without appliance-level insights, identifying energy wastage and making informed decisions to reduce electricity expenses can be difficult.

## 💡 Proposed Solution
## Live Website

[Open Electricity Consumption Analyzer](https://effortless-kangaroo-c57fb8.netlify.app/)

The Electricity Consumption Analyzer provides an interactive platform where users can enter their appliance details and usage patterns. The application calculates estimated energy consumption, analyzes appliance-wise usage, estimates electricity costs, and suggests ways to improve energy efficiency.

## ✨ Key Features

### 1. Personalized User Experience
- Collects the user's name to personalize the dashboard.
- Provides an interactive interface for entering appliance details.
- Displays results based on the user's inputs.

### 2. Appliance-Wise Electricity Analysis
- Allows users to add individual electrical appliances.
- Accepts appliance wattage and daily usage duration.
- Calculates estimated energy consumption for each appliance.
- Helps identify appliances with higher energy consumption.

### 3. Electricity Consumption Calculation
- Calculates energy consumption in kilowatt-hours (kWh), commonly called electricity units.
- Estimates daily, monthly, and other relevant consumption periods.
- Summarizes the estimated total consumption across the appliances entered.

### 4. Electricity Cost Estimation
- Estimates electricity expenses using calculated consumption and applicable tariff assumptions.
- Helps users understand how usage patterns affect estimated electricity costs.
- Supports awareness of relevant Tamil Nadu domestic electricity tariff rules and applicable concessions, where implemented.

### 5. Energy-Saving Recommendations
- Identifies opportunities to reduce unnecessary electricity consumption.
- Provides practical suggestions based on appliance usage patterns.
- Estimates potential energy or cost savings when sufficient information is available.
- Encourages energy-efficient habits and responsible electricity usage.

### 6. Interactive Dashboard and Visualization
- Presents appliance-wise consumption and total usage in an understandable format.
- Uses visual summaries to make comparisons easier.
- Updates calculated results when users change their inputs, where implemented.

## ⚙️ How It Works

1. **Enter user details:** The user provides their name to personalize the experience.
2. **Add appliances:** The user enters appliance names, wattage, quantity if supported, and daily operating hours.
3. **Calculate consumption:** The application estimates electricity usage using appliance power ratings and usage duration.
4. **Estimate costs:** The calculated consumption is used to estimate electricity expenses based on the tariff method implemented.
5. **Analyze usage:** The application compares appliances to identify those contributing more to estimated consumption.
6. **Receive recommendations:** The user receives suggestions for reducing avoidable electricity usage and costs.

## 🧮 Calculation Method

Electricity consumption is estimated using the following formula:

**Energy Consumption (kWh) = Power (W) × Usage Time (hours) ÷ 1000**

For example, an appliance rated at 1000 W and used for 2 hours consumes:

1000 × 2 ÷ 1000 = **2 kWh (2 units)**

For multiple appliances, their estimated consumption can be added to obtain the total usage for the selected period.

**Estimated Electricity Cost = Applicable Consumption Charges and Other Relevant Charges**

The final cost depends on the tariff structure, billing period, applicable concessions, and other relevant billing rules. Therefore, a simple per-unit calculation may not equal the user's actual electricity bill.

## 🛠️ Software Components

- **UI Design Tool:** Google Stitch
- **Frontend Technologies:** HTML, CSS, and JavaScript, if present in the exported implementation.
- **Calculation Logic:** Rule-based electricity consumption and cost estimation.
- **Recommendation Logic:** Usage-based energy-saving suggestions.
- **Database / Cloud:** Not included unless separately integrated.

## 🌱 Expected Impact

- Improves awareness of appliance-level electricity consumption.
- Helps users identify appliances that consume more energy.
- Encourages informed electricity usage and energy-efficient habits.
- Supports efforts to reduce unnecessary electricity wastage.
- Helps households, educational institutions, and other electricity consumers understand their usage patterns.
- Promotes responsible energy consumption and environmental awareness.

## 🎓 Project Scope

This project is designed as an accessible, first-year-level web application prototype. It focuses on applying basic web development concepts, arithmetic calculations, user interaction, and rule-based analysis to a practical energy-management problem.

The application can be extended in the future with actual smart-meter data, historical usage tracking, database integration, personalized analytics, and more advanced prediction methods.

## ⚠️ Limitations

- Consumption estimates depend on the accuracy of user-entered appliance ratings and usage durations.
- Actual appliance power consumption may vary with operating conditions.
- Estimated costs may differ from actual electricity bills because of tariff rules, concessions, billing periods, and additional charges.
- Advanced prediction, database, and cloud capabilities are not assumed unless implemented and tested.

## 🚀 Future Enhancements

- Store user profiles and historical consumption data.
- Generate monthly consumption reports.
- Compare estimated usage across different periods.
- Integrate smart-meter or IoT-based energy measurements.
- Develop more personalized energy-saving recommendations.
- Add predictive analytics when sufficient reliable data is available.

## 📌 Project Status

Initial web application prototype and ongoing development.

## 👩‍💻 Project Purpose

To make electricity consumption easier to understand by turning appliance usage information into meaningful consumption estimates, cost insights, and practical energy-saving recommendations.

---

