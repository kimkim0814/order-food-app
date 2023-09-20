class Api::V1::LineFoodsController < ApplicationController
  before_action :set_food, only: [:create, :replace]

  # 仮注文の一覧
  def index 
    line_foods = LineFood.active    # line_foodのうちactiveなものを取得
    if line_foods.exists?
      render json: {
        line_food_ids: line_foods.map { |line_food| line_food.id },   # map => 登録されているline_foodを配列化
        restaurant: line_foods[0].restaurant,
        count: line_foods.sum { |line_food| line_food[:count] },
        amount: line_foods.sum { |line_food| line_food.total_amount },
      }, status: :ok
    else
      render json: {}, status: :no_content     # response code "204 no_content"
    end
  end
  
  # 仮注文の作成
  def create
    # 例外パターン：他店舗での仮注文(アクティブなLineFood)がすでにある場合 => (早期リターン)
    if LineFood.active.other_restaurant(@ordered_food.restaurant.id).exists?
      return render json: {
        existing_restaurant: LineFood.other_restaurant(@ordered_food.id).first.restaurant.name,
        new_restaurant: Food.find(params[:food_id]).restaurant.name,
      }, status: :not_acceptable    # response code "406 Not Acceptable"
    end

    set_line_food(@ordered_food)

    if @line_food.save
      render json: {
        line_food: @line_food
      }, status: :created   # response code "201 created"
    else
      render json: {}, status: :internal_server_error   # response code "500 internal server error"
    end
  end

  # 仮注文の例外パターン
  def replace
    LineFood.active.other_restaurant(@ordered_food.restaurant.id).each do |line_food|
      line_food.update_attribute(:active, false)
    end

    set_line_food(@ordered_food)

    if @line_food.save
      render json: {
        line_food: @line_food
      }, status: :created
    else
      render json: {}, status: :internal_server_error
    end
  end

  private
    # @ordered_foodの設定
    def set_food
      @ordered_food = Food.find(params[:food_id])
    end

    def set_line_food(ordered_food)
      if ordered_food.line_food.present?  
        @line_food = ordered_food.line_food
        @line_food.attributes = {
          count: ordered_food.line_food.count + params[:count],
          active: true
        }
      else  
        @line_food = ordered_food.build_line_food(
          count: params[:count],
          restaurant: ordered_food.restaurant,
          active: true
        )
      end
    end
end
