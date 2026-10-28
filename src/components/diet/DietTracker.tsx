import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Droplet,
  Scale,
  Calendar,
  Flame,
  PieChart,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MealLog, FoodItem, MealType, WeightRecord, UserSettings } from '../../types';
import { formatDate, getTodayDateString } from '../../utils/currency';
import { exportDietReportPDF } from '../../utils/export';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface DietTrackerProps {
  meals: MealLog[];
  waterLogs: Record<string, number>;
  weightRecords: WeightRecord[];
  customFoods: FoodItem[];
  settings: UserSettings;
  onOpenAddMeal: (type?: MealType) => void;
  onDeleteMeal: (id: string) => void;
  onUpdateWater: (date: string, amountMl: number) => void;
  onSaveWeight: (record: WeightRecord) => void;
  onDeleteWeight: (id: string) => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const DietTracker: React.FC<DietTrackerProps> = ({
  meals,
  waterLogs,
  weightRecords,
  customFoods,
  settings,
  onOpenAddMeal,
  onDeleteMeal,
  onUpdateWater,
  onSaveWeight,
  onDeleteWeight,
  onUpdateSettings,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'meals' | 'water' | 'weight' | 'analytics'>('meals');
  const [mealToDelete, setMealToDelete] = useState<MealLog | null>(null);

  // Weight record dialog
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeightKg, setNewWeightKg] = useState('72.5');
  const [newWeightNotes, setNewWeightNotes] = useState('');

  // Target editing
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [tempCalorieTarget, setTempCalorieTarget] = useState(settings.dailyCalorieTarget.toString());
  const [tempWaterTarget, setTempWaterTarget] = useState(settings.dailyWaterTargetMl.toString());

  // Filter meals for the selected date
  const dayMeals = useMemo(() => {
    return meals.filter((m) => m.date === selectedDate);
  }, [meals, selectedDate]);

  // Calories & Macros for selected date
  const totalCalories = useMemo(() => dayMeals.reduce((s, m) => s + m.calories, 0), [dayMeals]);
  const totalProtein = useMemo(() => dayMeals.reduce((s, m) => s + m.proteinGrams, 0), [dayMeals]);
  const totalCarbs = useMemo(() => dayMeals.reduce((s, m) => s + m.carbsGrams, 0), [dayMeals]);
  const totalFat = useMemo(() => dayMeals.reduce((s, m) => s + m.fatGrams, 0), [dayMeals]);

  const calorieTarget = settings.dailyCalorieTarget || 2000;
  const remainingCalories = Math.max(0, calorieTarget - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

  // Water intake for selected date
  const dayWaterMl = waterLogs[selectedDate] || 0;
  const waterTargetMl = settings.dailyWaterTargetMl || 2500;
  const waterGlasses = Math.round(dayWaterMl / 250);
  const targetGlasses = Math.round(waterTargetMl / 250);

  // Meals grouped by type
  const mealSections: { type: MealType; title: string; defaultTime: string }[] = [
    { type: 'breakfast', title: 'Breakfast', defaultTime: '08:30' },
    { type: 'morning_snack', title: 'Morning Snack', defaultTime: '11:00' },
    { type: 'lunch', title: 'Lunch', defaultTime: '13:00' },
    { type: 'evening_snack', title: 'Evening Snack', defaultTime: '17:30' },
    { type: 'dinner', title: 'Dinner', defaultTime: '20:30' },
  ];

  // Navigate Date helper
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const handleAddWater = (ml: number) => {
    const newTotal = Math.max(0, dayWaterMl + ml);
    onUpdateWater(selectedDate, newTotal);
  };

  const handleSaveWeightEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(newWeightKg);
    if (isNaN(kg) || kg <= 0) return;

    // Calculate BMI if height is available
    let bmi: number | undefined;
    if (settings.userHeightCm && settings.userHeightCm > 0) {
      const heightM = settings.userHeightCm / 100;
      bmi = Number((kg / (heightM * heightM)).toFixed(1));
    }

    onSaveWeight({
      id: `w-${Date.now()}`,
      date: selectedDate,
      weightKg: kg,
      bmi,
      notes: newWeightNotes.trim() || undefined,
    });

    setIsWeightModalOpen(false);
    setNewWeightNotes('');
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      dailyCalorieTarget: parseInt(tempCalorieTarget, 10) || 2000,
      dailyWaterTargetMl: parseInt(tempWaterTarget, 10) || 2500,
    });
    setIsEditingTargets(false);
  };

  const handleExportPDF = () => {
    exportDietReportPDF({
      date: selectedDate,
      meals: dayMeals,
      waterMl: dayWaterMl,
      dailyCalorieTarget: calorieTarget,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Diet & Nutrition</h2>
          <p className="text-xs text-slate-500">Meals, calories, water intake & weight log</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportPDF}
            title="Download Diet Summary PDF"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAddMeal('breakfast')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Log Food
          </button>
        </div>
      </div>

      {/* Date Navigation Strip */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={() => changeDate(-1)}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-slate-900 dark:text-white">
            {formatDate(selectedDate)}
            {selectedDate === getTodayDateString() && ' (Today)'}
          </span>
        </div>

        <button
          onClick={() => changeDate(1)}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Subtabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
        {[
          { id: 'meals', label: 'Daily Meals', icon: Utensils },
          { id: 'water', label: 'Water Tracker', icon: Droplet },
          { id: 'weight', label: 'Weight & BMI', icon: Scale },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. DAILY MEALS VIEW */}
      {activeTab === 'meals' && (
        <div className="space-y-4">
          {/* Calorie & Macro Target Card */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-emerald-950 via-slate-900 to-slate-900 text-white border border-emerald-900/60 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" /> Daily Calorie Goal
              </span>
              <button
                onClick={() => setIsEditingTargets(true)}
                className="text-[11px] text-emerald-300 hover:underline"
              >
                Change Target
              </button>
            </div>

            <div className="flex justify-between items-baseline mb-2">
              <div>
                <span className="text-2xl font-black text-white">
                  {totalCalories} <span className="text-sm font-normal text-slate-400">/ {calorieTarget} kcal</span>
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-400">
                {remainingCalories} kcal left
              </span>
            </div>

            {/* Calorie Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  caloriePercent > 105 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${caloriePercent}%` }}
              />
            </div>

            {/* Macronutrient Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Protein</span>
                <span className="text-xs font-bold text-emerald-400">{totalProtein.toFixed(1)}g</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Carbs</span>
                <span className="text-xs font-bold text-amber-400">{totalCarbs.toFixed(1)}g</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Fats</span>
                <span className="text-xs font-bold text-rose-400">{totalFat.toFixed(1)}g</span>
              </div>
            </div>
          </div>

          {/* Meal Section Accordions */}
          <div className="space-y-3">
            {mealSections.map((sec) => {
              const mealsInSection = dayMeals.filter((m) => m.mealType === sec.type);
              const sectionCals = mealsInSection.reduce((s, m) => s + m.calories, 0);

              return (
                <div
                  key={sec.type}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {sec.title}
                      </h4>
                      {sectionCals > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {sectionCals} kcal
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenAddMeal(sec.type)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {mealsInSection.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No food logged yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {mealsInSection.map((meal) => (
                        <div key={meal.id} className="py-2 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {meal.foodName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {meal.servingSize} (x{meal.servingsCount}) · {meal.time}
                              {meal.notes ? ` · ${meal.notes}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {meal.calories} kcal
                              </span>
                              <p className="text-[9px] text-slate-400">
                                P:{meal.proteinGrams}g C:{meal.carbsGrams}g F:{meal.fatGrams}g
                              </p>
                            </div>
                            <button
                              onClick={() => setMealToDelete(meal)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Medical disclaimer note */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
            <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <span>
              Disclaimer: Calorie and macronutrient values are general estimates for daily wellness tracking. Daily Life Manager does not provide medical or clinical nutritional advice.
            </span>
          </div>
        </div>
      )}

      {/* 2. WATER TRACKER VIEW */}
      {activeTab === 'water' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-linear-to-br from-cyan-950 via-slate-900 to-slate-900 text-white border border-cyan-900/60 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-2">
              <Droplet className="w-6 h-6" />
            </div>

            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
              Water Intake
            </h3>
            <p className="text-3xl font-black text-white">
              {dayWaterMl} <span className="text-sm font-normal text-slate-400">/ {waterTargetMl} ml</span>
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {waterGlasses} of {targetGlasses} standard glasses logged
            </p>

            {/* Quick Add Buttons */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => handleAddWater(250)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                +250 ml (1 Glass)
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                +500 ml (1 Bottle)
              </button>
              {dayWaterMl > 0 && (
                <button
                  onClick={() => handleAddWater(-250)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  -250 ml
                </button>
              )}
            </div>
          </div>

          {/* Glasses Visualizer Grid */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              Daily Hydration Status (8-10 Glasses recommended)
            </h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const isFilled = i < waterGlasses;
                return (
                  <button
                    key={i}
                    onClick={() => onUpdateWater(selectedDate, (i + 1) * 250)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isFilled
                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Droplet className={`w-5 h-5 ${isFilled ? 'fill-cyan-500 text-cyan-500' : ''}`} />
                    <span className="text-[10px] font-bold mt-1">#{i + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. WEIGHT & BMI TRACKER VIEW */}
      {activeTab === 'weight' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Body Weight & BMI Log</h3>
              <p className="text-[11px] text-slate-500">
                Height: {settings.userHeightCm || 172} cm (Configurable in Settings)
              </p>
            </div>
            <button
              onClick={() => setIsWeightModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Log Weight
            </button>
          </div>

          {/* Weight History Table */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Weight History</h4>
            {weightRecords.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No weight entries recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {weightRecords.map((w) => (
                  <div key={w.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {w.weightKg} kg
                      </span>
                      {w.bmi && (
                        <span className="ml-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          BMI {w.bmi}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {formatDate(w.date)} {w.notes ? `· ${w.notes}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteWeight(w.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Target Setting Modal */}
      {isEditingTargets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Daily Nutrition & Hydration Goals
            </h3>
            <form onSubmit={handleSaveTargets} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  value={tempCalorieTarget}
                  onChange={(e) => setTempCalorieTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Daily Water Target (ml)</label>
                <input
                  type="number"
                  step="250"
                  value={tempWaterTarget}
                  onChange={(e) => setTempWaterTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTargets(false)}
                  className="px-3 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Weight Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Log Body Weight
            </h3>
            <form onSubmit={handleSaveWeightEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightKg}
                  onChange={(e) => setNewWeightKg(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Morning empty stomach"
                  value={newWeightNotes}
                  onChange={(e) => setNewWeightNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Meal Confirmation */}
      <ConfirmationModal
        isOpen={!!mealToDelete}
        title="Delete Logged Meal?"
        message={`Are you sure you want to remove "${mealToDelete?.foodName}" (${mealToDelete?.calories} kcal)?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (mealToDelete) {
            onDeleteMeal(mealToDelete.id);
            setMealToDelete(null);
          }
        }}
        onCancel={() => setMealToDelete(null)}
      />
    </div>
  );
};
