import { useState, useReducer, useEffect } from 'react';
import { useParams } from "react-router-dom"
import styled from 'styled-components';
import { useNavigate, Link } from "react-router-dom";

// components
import { LocalMallIcon } from '../components/Icons';
import { FoodWrapper } from '../components/FoodWrapper';
import { NewOrderConfirmDialog } from '../components/NewOrderConfirmDialog';
import Skeleton from '@mui/material/Skeleton';
import { FoodOrderDialog } from '../components/FoodOrderDialog';

// reducers
import {
  initialState as foodsInitialState,
  foodsActionTypes,
  foodsReducer,
} from '../reducers/foods';
// apis
import { fetchFoods } from '../apis/foods';
import { postLineFoods, replaceLineFoods } from '../apis/line_foods';

// images
import MainLogo from '../images/logo.png';
import FoodImage from '../images/food-image.jpg';

// constants
import { HTTP_STATUS_CODE } from '../constants';
import { COLORS } from '../style_constants';
import { REQUEST_STATE } from '../constants';

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 32px;
`;

const BagIconWrapper = styled.div`
  padding-top: 24px;
`;

const ColoredBagIcon = styled(LocalMallIcon)`
  color: ${COLORS.MAIN};
`;

const MainLogoImage = styled.img`
  height: 90px;
`

const FoodsList = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: 50px;
`;

const ItemWrapper = styled.div`
margin: 16px;
`;

export const Foods = ({}) => {
  const [foodsState, dispatch] = useReducer(foodsReducer, foodsInitialState);
  const navigate = useNavigate();

  const initialState = {
    isOpenOrderDialog: false,
    selectedFood: null,
    selectedFoodCount: 1,
    isOpenNewOrderDialog: false,
    existingResutaurautName: '',
    newResutaurautName: '',
  };
  const [state,setState] = useState(initialState);

  const { restaurantsId } = useParams()

  const submitOrder = () => {
    postLineFoods({
      foodId: state.selectedFood.id,
      count: state.selectedFoodCount,
    }).then(() => navigate('/orders'))    // '/orders'に遷移
      .catch((e) => {
        if (e.response.status === HTTP_STATUS_CODE.NOT_ACCEPTABLE) {  //例外パターン(line_foods#create参照)
          setState({
            ...state,
            isOpenOrderDialog: false,
            isOpenNewOrderDialog: true,
            existingRestaurantName: e.response.data.existing_restaurant,
            newRestaurantName: e.response.data.new_restaurant,
          })
        } else {
          throw e;
        }
      })
  };
  
  const replaceOrder = () => {
    replaceLineFoods({
      foodId: state.selectedFood.id,
      count: state.selectedFoodCount,
    }).then(() => navigate('/orders'))
  }

  useEffect(() => {
    dispatch({ type: foodsActionTypes.FETCHING });
    fetchFoods(restaurantsId)
      .then((data) => {
        dispatch({
          type: foodsActionTypes.FETCH_SUCCESS,
          payload: {
            foods: data.foods
          }
        });
      })
  }, []);

  return (
    <>
      <HeaderWrapper>
        <Link to="/restaurants">
          <MainLogoImage src={MainLogo} alt="main logo" />
        </Link>
        <BagIconWrapper>
          <Link to="/orders">
            <ColoredBagIcon fontSize="large" />
          </Link>
        </BagIconWrapper>
      </HeaderWrapper>
      <FoodsList>
        {
          foodsState.fetchState === REQUEST_STATE.LOADING ?
            <>
              {
                [...Array(12).keys()].map(i =>
                  <ItemWrapper key={i}>
                    <Skeleton key={i} variant="rect" width={450} height={180} />
                  </ItemWrapper>
                )
              }
            </>
          :
            foodsState.foodsList.map(food =>
              <ItemWrapper key={food.id}>
                <FoodWrapper
                  food={food}
                  onClickFoodWrapper={(food) => setState({
                    ...state,
                    isOpenOrderDialog: true,
                    selectedFood: food,
                  })}
                  imageUrl={FoodImage}
                />
              </ItemWrapper>
            )
        }
      </FoodsList>
      {
        state.isOpenOrderDialog &&
          <FoodOrderDialog
          isOpen={state.isOpenOrderDialog}
          food={state.selectedFood}
          countNumber={state.selectedFoodCount}
          onClickCountUp={() => setState({
            ...state,
            selectedFoodCount: state.selectedFoodCount + 1,
          })}
          onClickCountDown={() => setState({
            ...state,
            selectedFoodCount: state.selectedFoodCount - 1,
          })}
          onClickOrder={() => submitOrder()}
          onClose={() => setState({
            ...state,
            isOpenOrderDialog: false,
            selectedFood: null,
            selectedFoodCount: 1,
          })}
        />
      }
      {
      state.isOpenNewOrderDialog &&
      <NewOrderConfirmDialog
        isOpen={state.isOpenNewOrderDialog}
        onClose={() => setState({ ...state, isOpenNewOrderDialog: false })}
        existingResutaurautName={state.existingResutaurautName}
        newResutaurautName={state.newResutaurautName}
        onClickSubmit={() => replaceOrder()}
      />
    }
    </>
  )
}
