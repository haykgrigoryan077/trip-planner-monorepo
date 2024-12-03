from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import random
from sklearn.cluster import KMeans
import csv

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load data from CSV files
cities_df = pd.read_csv('csv/cities1.csv')
country_data = pd.read_csv('csv/country.csv')
restaurant_data = pd.read_csv('csv/restoran.csv')
hotel_data = pd.read_csv('csv/hotels.csv')
places_to_visit_data = pd.read_csv('csv/places.csv')
user_preferences = pd.read_csv('csv/user_preferences1.csv')
budget_data = pd.read_csv('csv/budget.csv')

def format_city_data(city_data):
    return {
        'city': city_data.get('city', ''), 
        'country': city_data.get('country', ''),  
        'hotels': city_data.get('hotels', []),  
        'places_to_visit': city_data.get('places_to_visit', []), 
        'restaurants': city_data.get('restaurants', []), 
    }


city_budgets = {}
with open('csv/budget.csv', mode='r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        city_budgets[row['City']] = {
            'Solo_Budget': float(row['Solo_Budget']),
            'Couple_Budget': float(row['Couple_Budget']),
            'Child_Budget': float(row['Child_Budget'])
        }

n_clusters = 20
kmeans = KMeans(n_clusters=n_clusters, random_state=42)
user_ratings = user_preferences.iloc[:, 2:].values
user_preferences['Cluster'] = kmeans.fit_predict(user_ratings)

def generate_recommendations(new_user_ratings):
    new_user_cluster = kmeans.predict([new_user_ratings])[0]
    cluster_city_ids = user_preferences[user_preferences['Cluster'] == new_user_cluster]['City_ID'].unique()
    recommended_cities = cities_df[cities_df['City_ID'].isin(cluster_city_ids)]['City'].tolist()
    return random.choice(recommended_cities)

def calculate_average_cost(vacation_type, num_children, num_days, city_id):
    budget_info = budget_data[budget_data['City_ID'] == city_id].iloc[0]
    if vacation_type == 'solo':
        average_cost = budget_info['Solo_Budget'] * num_days
    elif vacation_type == 'couple':
        average_cost = budget_info['Couple_Budget'] * num_days
    elif vacation_type == 'family':
        child_budget = budget_info['Child_Budget'] * num_children
        average_cost = (budget_info['Couple_Budget'] + child_budget) * num_days
    return float(average_cost)  # Convert to float for JSON serialization

@app.route('/recommendations', methods=['POST'])
def recommendations():
    try:
        data = request.json
        new_user_ratings = data['ratings']  # Expect a list of ratings
        recommended_city = generate_recommendations(new_user_ratings)
        return jsonify({'recommended_city': recommended_city})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/cost', methods=['POST'])
def cost():
    try:
        city_name = request.json.get('city_name')
        num_children = int(request.json.get('num_children'))
        num_days = int(request.json.get('num_days'))
        vacation_type = request.json.get('vacation_type')

        if city_name not in city_budgets:
            return jsonify({"error": "City not found"}), 400

        if num_days <= 0 or num_children < 0:
            return jsonify({"error": "Invalid input values"}), 400

        city_budget = city_budgets[city_name]
        
        if vacation_type == 'solo':
            base_cost = city_budget['Solo_Budget']
        elif vacation_type == 'couple':
            base_cost = city_budget['Couple_Budget']
        else:
            return jsonify({"error": "Invalid vacation type"}), 400
        
        cost = (base_cost + (city_budget['Child_Budget'] * num_children)) * num_days

        return jsonify({"average_cost": round(cost, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/city-info', methods=['GET'])
def city_info():
    try:
        city_name = request.args.get('city_name')
        vacation_type = request.args.get('vacation_type', 'solo')

        city_id = cities_df.loc[cities_df['City'] == city_name, 'City_ID'].values[0]
        country_name = country_data.loc[country_data['City_ID'] == city_id, 'Country_Name'].values[0] if not country_data[country_data['City_ID'] == city_id].empty else "Unknown"
        
        hotels = hotel_data[hotel_data['City'] == city_name].to_dict('records')
        restaurants = restaurant_data[restaurant_data['City'] == city_name].to_dict('records')
        places = places_to_visit_data[places_to_visit_data['City'] == city_name].to_dict('records')

        city_data = format_city_data({
            'city': city_name,
            'country': country_name,
            'hotels': hotels,
            'restaurants': restaurants,
            'places_to_visit': places
        })

        return jsonify(city_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
