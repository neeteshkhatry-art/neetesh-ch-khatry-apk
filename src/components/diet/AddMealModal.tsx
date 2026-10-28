import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Utensils, Sparkles, Check, Info } from 'lucide-react';
import { MealLog, MealType, FoodItem } from '../../types';
import { getTodayDateString } from '../../utils/currency';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: Omit<MealLog, 'id' | 'createdAt'>) => void;
  onSaveCustomFood: (food: FoodItem) => void;
  availableFoods: FoodItem[];
  defaultMealType?: MealType;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onSaveMeal,
  onSaveCustomFood,
  availableFoods,
  defaultMealType = 'breakfast',
}) => {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingsCount, setServingsCount] = useState<number>(1);
  const [foodName, setFoodName] = useState('');
  const [servingSize, setServingSize] = useState('1 serving');
  const [caloriesPerServing, setCaloriesPerServing] = useState<number>(150);
  const [proteinGrams, setProteinGrams] = useState<number>(5);
  const [carbsGrams, setCarbsGrams] = useState<number>(20);
  const [fatGrams, setFatGrams] = useState<number>(4);
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [notes, setNotes] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  useEffect(() => {
    setMealType(defaultMealType);
    setSearchQuery('');
    setSelectedFood(null);
    setServingsCount(1);
    setFoodName('');
    setServingSize('1 serving');
    setCaloriesPerServing(150);
    setProteinGrams(5);
    setCarbsGrams(20);
    setFatGrams(4);
    setIsCreatingCustom(false);
    setDate(getTodayDateString());
  }, [isOpen, defaultMealType]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setFoodName(food.name);
    setServingSize(food.servingSize);
    setCaloriesPerServing(food.calories);
    setProteinGrams(food.proteinGrams);
    setCarbsGrams(food.carbsGrams);
    setFatGrams(food.fatGrams);
    setSearchQuery('');
  };

  const filteredFoods = availableFoods.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      alert('Please specify a food name');
      return;
    }

    const totalCals = Math.round(caloriesPerServing * servingsCount);
    const totalP = Number((proteinGrams * servingsCount).toFixed(1));
    const totalC = Number((carbsGrams * servingsCount).toFixed(1));
    const totalF = Number((fatGrams * servingsCount).toFixed(1));

    if (isCreatingCustom) {
      onSaveCustomFood({
        id: `custom-${Date.now()}`,
        name: foodName.trim(),
        servingSize: servingSize.trim(),
        calories: caloriesPerServing,
        proteinGrams,
        carbsGrams,
        fatGrams,
        category: 'Custom Dishes',
        isCustom: true,
      });
    }

    onSaveMeal({
      mealType,
      foodName: foodName.trim(),
      servingSize: servingSize.trim(),
      servingsCount,
      calories: totalCals,
      proteinGrams: totalP,
      carbsGrams: totalC,
      fatGrams: totalF,
      date,
      time,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              Log Meal / Food Item
            </h2>
            <p className="text-xs text-slate-500">Track calorie intake and daily macronutrients</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Tabs */}
        <div className="px-4 pt-3 pb-1">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Meal Time
          </label>
          <div className="grid grid-cols-5 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-[11px] font-medium text-center">
            {[
              { id: 'breakfast', label: 'Breakfast' },
              { id: 'morning_snack', label: 'M-Snack' },
              { id: 'lunch', label: 'Lunch' },
              { id: 'evening_snack', label: 'E-Snack' },
              { id: 'dinner', label: 'Dinner' },
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMealType(m.id as MealType)}
                className={`py-2 rounded-xl transition-all ${
                  mealType === m.id
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Search Indian Food Library */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pick from Indian Food Database
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCustom(!isCreatingCustom);
                  setSelectedFood(null);
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                {isCreatingCustom ? 'Browse Database' : '+ Add Custom Dish'}
              </button>
            </div>

            {!isCreatingCustom && (
              <>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Roti, Dal, Idli, Dosa, Poha, Paneer, Egg..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Filtered food chips */}
                <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-slate-100 dark:border-slate-800 p-1 bg-slate-50/50 dark:bg-slate-800/30">
                  {filteredFoods.slice(0, 10).map((f) => {
                    const isSelected = selectedFood?.id === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => handleSelectFood(f)}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{f.name}</p>
                          <p className="text-[11px] text-slate-500">{f.servingSize}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{f.calories} kcal</span>
                          <p className="text-[10px] text-slate-400">P:{f.proteinGrams}g C:{f.carbsGrams}g F:{f.fatGrams}g</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Food Details Form */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Food / Dish Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Masala Dosa with Sambar"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Serving Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 bowl, 2 pieces"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Servings
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={servingsCount}
                    onChange={(e) => setServingsCount(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-1">
                    {[1, 2].map((cnt) => (
                      <button
                        type="button"
                        key={cnt}
                        onClick={() => setServingsCount(cnt)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium ${
                          servingsCount === cnt ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cnt}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Macros Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Calories
                </label>
                <input
                  type="number"
                  min="0"
                  value={caloriesPerServing}
                  onChange={(e) => setCaloriesPerServing(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbsGrams}
                  onChange={(e) => setCarbsGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fatGrams}
                  onChange={(e) => setFatGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Total calculated preview */}
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
              <span className="font-medium">Total Meal Intake:</span>
              <span className="font-bold text-sm">
                {Math.round(caloriesPerServing * servingsCount)} kcal
              </span>
            </div>
          </div>

          {/* Date, Time, Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less oil, homemade with ghee"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Disclaimer */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
            <Info className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Nutrition values are estimates for wellness tracking and not medical advice.</span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
            >
              Log Meal Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
