from flask import Flask, request, jsonify
import pandas as pd
import random
from sklearn.cluster import KMeans

# Initialize Flask app
app = Flask(__name__)

# Load data from CSV files
cities_df = pd.read_csv('csv/cities1.csv')
country_data = pd.read_csv('csv/country.csv')
restaurant_data = pd.read_csv('csv/restoran.csv')
hotel_data = pd.read_csv('csv/hotels.csv')
places_to_visit_data = pd.read_csv('csv/places.csv')
user_preferences = pd.read_csv('csv/user_preferences1.csv')
budget_data = pd.read_csv('csv/budget.csv')

# Perform k-means clustering on the ratings
n_clusters = 20
kmeans = KMeans(n_clusters=n_clusters, random_state=42)
user_ratings = user_preferences.iloc[:, 2:].values
user_preferences['Cluster'] = kmeans.fit_predict(user_ratings)

# Function to generate recommendations for a new user
def generate_recommendations(new_user_ratings):
    new_user_cluster = kmeans.predict([new_user_ratings])[0]
    cluster_city_ids = user_preferences[user_preferences['Cluster'] == new_user_cluster]['City_ID'].unique()
    recommended_cities = cities_df[cities_df['City_ID'].isin(cluster_city_ids)]['City'].tolist()
    return random.choice(recommended_cities)

# Function to calculate average cost
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

# API Endpoints
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
        data = request.json
        vacation_type = data['vacation_type']
        num_children = data.get('num_children', 0)
        num_days = data['num_days']
        city_name = data['city_name']

        city_id = cities_df.loc[cities_df['City'] == city_name, 'City_ID'].values[0]
        average_cost = calculate_average_cost(vacation_type.lower(), num_children, num_days, city_id)
        return jsonify({'average_cost': average_cost})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

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

        return jsonify({
            'city': city_name,
            'country': country_name,
            'hotels': hotels,
            'restaurants': restaurants,
            'places_to_visit': places
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
