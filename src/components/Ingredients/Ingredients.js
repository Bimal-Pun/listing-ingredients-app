import React, {useMemo, useReducer, useState} from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import { useEffect, useCallback } from 'react';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing=> ing.id !== action.id);
    default:
      throw new Error ('getting here is impossible!');
  }
};

const httpReducer =(currhttpState,action) => {
  switch (action.type){
    case 'SEND':
      return {loading: true, error: null};
    case 'RESPONSE':
      return { ...currhttpState, loading: false};
    case 'ERROR':
      return {loading: false, error: action.errorMessage};
    case 'CLEAR':
      return{...currhttpState, error: null};
    default:
      throw new Error ('getting here is impossible!');
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHtttp] = useReducer(httpReducer, { loading: false, error: null});
  //const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading,setISLoading] = useState(false);
  const [error, setError]= useState();

  useEffect(() => {
    fetch('https://hooks-update-3c8f1-default-rtdb.firebaseio.com/ingredients.json')
    .then (response => response.json())
    .then(responseData => {
      const loadedIngredients = [];
      for (const key in responseData) {
        loadedIngredients.push({
          id: key,
          title: responseData[key].title,
          amount: responseData[key].amount
        });
      }
      //setUserIngredients(loadedIngredients);
    });
  }, []);

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    //setUserIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients});
  }, []);

  const addIngredientHandler = useCallback( ingredient => {
    dispatchHtttp({type : 'SEND'});
    fetch('https://hooks-update-3c8f1-default-rtdb.firebaseio.com/ingredients.json', {
      method: 'Post',
      body: JSON.stringify(ingredient),
      headers: {'Content-Type': 'application/json'}
    })
      .then(response => {
        dispatchHtttp({type : 'RESPONSE'});
        return response.json();
      })
      .then (responseData => {
      //   setUserIngredients(prevIngredients => [
      //     ...prevIngredients, 
      //     { id: responseData.name, ...ingredient }
      // ]);
      dispatch({
        type: 'ADD',
        ingredient: {id: responseData.name, ...ingredient}
      })
    });
  }, []);

  const removeIngredientHandler = useCallback(ingredientId => {
    setISLoading(true);
    fetch(`https://hooks-update-3c8f1-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`, {
        method: 'Delete',
      }
    ).then (response => {
      setISLoading(false);
      // setUserIngredients(prevIngredients =>
      //   prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      // );
      dispatch({type: 'DELETE', id: ingredientId})
    }).catch (error => {
      dispatchHtttp({type : 'ERROR', errorMessage: 'Something went wrong!' });
    });
  }, []);

  const clearError = useCallback(() => {
    dispatchHtttp({type: 'CLEAR'});
  }, []);

  const ingredientList = useMemo(()=>{
    return (
      <IngredientList
      ingredients={userIngredients}
      onRemoveItem={removeIngredientHandler}
    />
    );
  }, [userIngredients, removeIngredientHandler]);
 
  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose ={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading ={httpState.loading} 
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}

      </section>
    </div>
  );
};

export default Ingredients;
