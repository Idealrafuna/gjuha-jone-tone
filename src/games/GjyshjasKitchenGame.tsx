import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Heart, Trophy, Clock, X, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "free" | "premium";

type Ingredient = {
  id: string;
  name: string;
  emoji: string;
  category: "meat" | "vegetable" | "dairy" | "spice" | "grain" | "other";
};

type Recipe = {
  id: string;
  name: string;
  emoji: string;
  difficulty: "easy" | "medium" | "hard";
  ingredients: string[]; // ingredient IDs in correct order
  description: string;
  cookingMethod: "pot" | "tray" | "pan";
};

type Props = {
  mode?: Mode;
  userId?: string | null;
  onClose?: () => void;
  onAwardXP?: (xp: number) => void;
};

// Albanian ingredients
const INGREDIENTS: Ingredient[] = [
  { id: "flour", name: "Miell", emoji: "🌾", category: "grain" },
  { id: "eggs", name: "Vezë", emoji: "🥚", category: "dairy" },
  { id: "cheese", name: "Djathë", emoji: "🧀", category: "dairy" },
  { id: "spinach", name: "Spinaq", emoji: "🥬", category: "vegetable" },
  { id: "onion", name: "Qepë", emoji: "🧅", category: "vegetable" },
  { id: "tomato", name: "Domate", emoji: "🍅", category: "vegetable" },
  { id: "lamb", name: "Mish qengji", emoji: "🥩", category: "meat" },
  { id: "yogurt", name: "Kos", emoji: "🥛", category: "dairy" },
  { id: "pepper", name: "Spec", emoji: "🌶️", category: "vegetable" },
  { id: "rice", name: "Oriz", emoji: "🍚", category: "grain" },
  { id: "oil", name: "Vaj", emoji: "🫒", category: "other" },
  { id: "salt", name: "Kripë", emoji: "🧂", category: "spice" },
  { id: "garlic", name: "Hudhra", emoji: "🧄", category: "spice" },
  { id: "phyllo", name: "Brumë jufke", emoji: "📜", category: "grain" },
  { id: "milk", name: "Qumësht", emoji: "🥛", category: "dairy" },
  { id: "butter", name: "Gjalp", emoji: "🧈", category: "dairy" },
];

// Traditional Albanian recipes
const RECIPES: Recipe[] = [
  {
    id: "byrek_spinach",
    name: "Byrek me Spinaq",
    emoji: "🥧",
    difficulty: "easy",
    ingredients: ["phyllo", "spinach", "cheese", "eggs", "oil"],
    description: "Traditional Albanian spinach pie with phyllo pastry",
    cookingMethod: "tray"
  },
  {
    id: "simple_qofte",
    name: "Qofte të Thjeshta",
    emoji: "🍡",
    difficulty: "easy",
    ingredients: ["lamb", "onion", "salt", "eggs"],
    description: "Simple Albanian meatballs",
    cookingMethod: "pan"
  },
  {
    id: "tave_kosi",
    name: "Tavë Kosi",
    emoji: "🍲",
    difficulty: "medium",
    ingredients: ["lamb", "rice", "yogurt", "eggs", "garlic", "salt"],
    description: "National dish of Albania - baked lamb with yogurt",
    cookingMethod: "tray"
  },
  {
    id: "byrek_cheese",
    name: "Byrek me Djathë",
    emoji: "🧀",
    difficulty: "medium",
    ingredients: ["phyllo", "cheese", "eggs", "milk", "butter", "salt"],
    description: "Cheese byrek with creamy filling",
    cookingMethod: "tray"
  },
  {
    id: "stuffed_peppers",
    name: "Speca të Mbushur",
    emoji: "🫑",
    difficulty: "hard",
    ingredients: ["pepper", "rice", "lamb", "onion", "tomato", "garlic", "salt"],
    description: "Stuffed bell peppers with meat and rice",
    cookingMethod: "pot"
  },
  {
    id: "flija",
    name: "Flia",
    emoji: "🥞",
    difficulty: "hard",
    ingredients: ["flour", "milk", "eggs", "butter", "salt"],
    description: "Traditional layered pancake from Kosovo",
    cookingMethod: "pan"
  }
];

export default function GjyshjasKitchenGame({
  mode = "free",
  userId = null,
  onClose,
  onAwardXP,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [addedIngredients, setAddedIngredients] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showFailAnimation, setShowFailAnimation] = useState(false);
  const [draggedIngredient, setDraggedIngredient] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const config = useMemo(() => {
    if (mode === "premium") {
      return {
        availableRecipes: RECIPES,
        xpPerStep: 15,
        xpBonus: 100,
        livesStart: 5,
      };
    }
    return {
      availableRecipes: RECIPES.filter(r => r.difficulty === "easy"),
      xpPerStep: 10,
      xpBonus: 50,
      livesStart: 3,
    };
  }, [mode]);

  // Start new recipe
  const startNewRecipe = useCallback(() => {
    const recipes = config.availableRecipes;
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    
    setCurrentRecipe(randomRecipe);
    setAddedIngredients([]);
    setCurrentStep(0);
    setIsComplete(false);
    
    // Shuffle available ingredients (include recipe ingredients + some extras)
    const recipeIngredients = INGREDIENTS.filter(ing => 
      randomRecipe.ingredients.includes(ing.id)
    );
    const extraIngredients = INGREDIENTS.filter(ing => 
      !randomRecipe.ingredients.includes(ing.id)
    ).slice(0, 3);
    
    const shuffled = [...recipeIngredients, ...extraIngredients]
      .sort(() => Math.random() - 0.5);
    
    setAvailableIngredients(shuffled);
  }, [config.availableRecipes]);

  // Check if ingredient is correct for current step
  const checkIngredient = useCallback((ingredientId: string) => {
    if (!currentRecipe) return false;
    
    const correctIngredient = currentRecipe.ingredients[currentStep];
    const isCorrect = ingredientId === correctIngredient;
    
    if (isCorrect) {
      setAddedIngredients(prev => [...prev, ingredientId]);
      setCurrentStep(prev => prev + 1);
      setScore(prev => prev + 50);
      onAwardXP?.(config.xpPerStep);
      
      // Check if recipe is complete
      if (currentStep + 1 >= currentRecipe.ingredients.length) {
        setIsComplete(true);
        setScore(prev => prev + config.xpBonus);
        onAwardXP?.(config.xpBonus);
        
        setTimeout(() => {
          startNewRecipe();
        }, 3000);
      }
    } else {
      setShowFailAnimation(true);
      setLives(prev => Math.max(0, prev - 1));
      
      setTimeout(() => {
        setShowFailAnimation(false);
      }, 1000);
    }
    
    return isCorrect;
  }, [currentRecipe, currentStep, config, onAwardXP, startNewRecipe]);

  // Handle ingredient drop
  const handleIngredientDrop = useCallback((ingredientId: string) => {
    checkIngredient(ingredientId);
    setDraggedIngredient(null);
  }, [checkIngredient]);

  // Start game
  const startGame = useCallback(() => {
    setPlaying(true);
    setLives(config.livesStart);
    setScore(0);
    startNewRecipe();
  }, [config.livesStart, startNewRecipe]);

  // Restart game
  const restart = useCallback(() => {
    setPlaying(true);
    setLives(config.livesStart);
    setScore(0);
    startNewRecipe();
  }, [config.livesStart, startNewRecipe]);

  // Game over check
  useEffect(() => {
    if (lives <= 0 && playing) {
      setPlaying(false);
    }
  }, [lives, playing]);

  const getCookingVessel = () => {
    switch (currentRecipe?.cookingMethod) {
      case "pot":
        return { emoji: "🍲", name: "Tenxhere" };
      case "tray":
        return { emoji: "🥘", name: "Tavë" };
      case "pan":
        return { emoji: "🍳", name: "Tigan" };
      default:
        return { emoji: "🍲", name: "Enë gatimi" };
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur shadow-sm">
        <div className="flex items-center gap-3">
          <ChefHat className="h-6 w-6 text-orange-600" />
          <div>
            <h2 className="font-bold text-xl text-orange-800">Gjyshja's Kitchen</h2>
            <p className="text-sm text-orange-600">Cook traditional Albanian dishes!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold">{score}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: config.livesStart }).map((_, i) => (
              <Heart
                key={i}
                className={`h-5 w-5 ${i < lives ? "text-red-500" : "text-gray-300"}`}
              />
            ))}
          </div>
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Game Content */}
      {playing && currentRecipe ? (
        <div className="flex-1 flex flex-col p-4 gap-4">
          {/* Recipe Card */}
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{currentRecipe.emoji}</span>
              <div>
                <h3 className="text-2xl font-bold text-orange-800">{currentRecipe.name}</h3>
                <p className="text-gray-600">{currentRecipe.description}</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">Hapat:</span>
              {currentRecipe.ingredients.map((ingredientId, index) => {
                const ingredient = INGREDIENTS.find(ing => ing.id === ingredientId);
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div
                    key={ingredientId}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-500 text-white animate-pulse"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {ingredient?.emoji || "?"}
                  </div>
                );
              })}
            </div>
            
            {/* Current instruction */}
            {currentStep < currentRecipe.ingredients.length && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-blue-800 font-medium">
                  Hapi {currentStep + 1}: Shto{" "}
                  <span className="font-bold">
                    {INGREDIENTS.find(ing => ing.id === currentRecipe.ingredients[currentStep])?.name}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Cooking Area */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-white/90 rounded-2xl p-8 shadow-lg mb-6">
              <motion.div
                className={`text-8xl mb-4 ${showFailAnimation ? "animate-bounce" : ""}`}
                animate={showFailAnimation ? { 
                  rotate: [-5, 5, -5, 5, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {getCookingVessel().emoji}
              </motion.div>
              <p className="text-center text-gray-600 font-medium">
                {getCookingVessel().name}
              </p>
            </div>

            {/* Added Ingredients Display */}
            {addedIngredients.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap justify-center">
                {addedIngredients.map((ingredientId, index) => {
                  const ingredient = INGREDIENTS.find(ing => ing.id === ingredientId);
                  return (
                    <motion.div
                      key={`${ingredientId}-${index}`}
                      className="bg-green-100 rounded-full px-3 py-1 text-sm font-medium text-green-800 flex items-center gap-1"
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span>{ingredient?.emoji}</span>
                      <span>{ingredient?.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Success Animation */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">Shumë mirë!</p>
                  <p className="text-green-700">Recipe completed perfectly!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ingredients */}
          <div className="bg-white/90 rounded-2xl p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-3 text-center">Përbërësit</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableIngredients.map((ingredient) => (
                <motion.button
                  key={ingredient.id}
                  className={`p-3 rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 transition-colors ${
                    addedIngredients.includes(ingredient.id) ? "opacity-50 pointer-events-none" : ""
                  }`}
                  onClick={() => handleIngredientDrop(ingredient.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={addedIngredients.includes(ingredient.id)}
                >
                  <div className="text-3xl mb-1">{ingredient.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{ingredient.name}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Start/Game Over Screen
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            className="bg-white/95 rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👵🏻
            </motion.div>
            <h3 className="text-2xl font-bold mb-2 text-orange-800">
              {lives <= 0 ? "Game Over!" : "Mirë se erdhe në Gjyshja's Kitchen!"}
            </h3>
            
            {lives <= 0 ? (
              <>
                <p className="text-gray-700 mb-4">
                  Final Score: <span className="font-bold">{score}</span>
                </p>
                <div className="flex gap-2">
                  <Button onClick={restart} className="flex-1 bg-orange-600 hover:bg-orange-700">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Luaj Përsëri
                  </Button>
                  {onClose && (
                    <Button onClick={onClose} variant="outline" className="flex-1">
                      Exit
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  Learn to cook traditional Albanian dishes with Gjyshja!
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Mode: <span className="font-semibold">{mode === "premium" ? "Premium" : "Free"}</span>
                </p>
                <Button onClick={startGame} className="w-full bg-orange-600 hover:bg-orange-700">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Fillo Gatimin!
                </Button>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Fail Animation Overlay */}
      <AnimatePresence>
        {showFailAnimation && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.5 }}
            >
              😅
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}