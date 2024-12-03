import React, { useState } from 'react';
import { Layout, Form, Input, Button, Select, message, Card } from 'antd';
import axios from 'axios';
import './App.css';

import { Link, animateScroll as scroll } from 'react-scroll';
import { cities } from './cities';

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const categories = [
  'Gyms',
  'Local_Services',
  'Monuments',
  'Museums',
  'Parks',
  'Restaurants',
  'Swimming_Pools',
  'Theatres',
  'View_Points',
];


const App = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [cost, setCost] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [ratings, setRatings] = useState({
    Gyms: '',
    Local_Services: '',
    Monuments: '',
    Museums: '',
    Parks: '',
    Restaurants: '',
    Swimming_Pools: '',
    Theatres: '',
    View_Points: '',
  });

  message.config({
    rtl: true,
    duration: 3,
  });

  const handleChange = (category, value) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const isFormValid = () => {
    return Object.values(ratings).every((rating) => rating !== '');
  };

  const handleRecommendationSubmit = async () => {
    if (!isFormValid()) {
      message.error('Please fill all ratings.');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/recommendations',
        {
          ratings: Object.values(ratings).map(Number),
        }
      );
      setRecommendation(response.data.recommended_city);
      message.success('City recommendation fetched!');
    } catch (error) {
      console.error(error);
      message.error('Error fetching city recommendation.');
    }
  };

  const handleCostSubmit = async (values) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/cost', values);
      setCost(response.data.average_cost);
      message.success('Cost calculated!');
    } catch (error) {
      console.error(error);
      message.error('Error calculating cost.');
    }
  };

  const handleCityInfoFetch = async (values) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/city-info?city_name=${values.city_name}&vacation_type=${values.vacation_type}`
      );
      setCityInfo(response.data);
      message.success('City information fetched!');
    } catch (error) {
      console.error(error);
      message.error('Error fetching city information.');
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="header">
        <div className="header-title">Vacation Recommendations</div>
        <div className="links-wrapper">
          <Link to="about" smooth={true} duration={500} className="anchor">
            About Us
          </Link>
          <Link to="contact" smooth={true} duration={500} className="anchor">
            Contact Us
          </Link>
          <Link
            to="recommendations"
            smooth={true}
            duration={500}
            className="anchor"
          >
            Get Recommendations
          </Link>
        </div>
      </Header>

      <Content className="content">
        <Card className="about-card" title="About Us" id="about">
          <p>
            Welcome to Vacation Recommendations, where we help you plan the
            perfect vacation. Based on your preferences, we'll suggest
            destinations, calculate costs, and provide information on cities
            worldwide. Explore new places with ease!
          </p>
        </Card>

        <Card className="contact-card" title="Contact Us" id="contact">
          <p>
            If you have any questions or need assistance, feel free to reach
            out:
          </p>
          <p>Email: support@vacationrecommendations.com</p>
          <p>Phone: +1 800 123 4567</p>
        </Card>

        <Card title="Get Recommendations" id="recommendations" className="card">
          <Form onFinish={handleRecommendationSubmit}>
            {categories.map((category) => (
              <Form.Item
                name={category}
                label={category}
                key={category}
                className="form-item"
                rules={[
                  { required: true, message: `Please rate ${category}!` },
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={ratings[category]}
                  onChange={(e) => handleChange(category, e.target.value)}
                  placeholder={`Rate for ${category}`}
                  className="input-field"
                />
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
              >
                Get Recommendation
              </Button>
            </Form.Item>
          </Form>
          {recommendation && (
            <p>
              <strong>Recommended City:</strong> {recommendation}
            </p>
          )}
        </Card>

        <Card title="Calculate Trip Cost" className="card">
          <Form onFinish={handleCostSubmit}>
            <Form.Item
              name="vacation_type"
              label="Vacation Type"
              className="form-item"
              rules={[
                { required: true, message: 'Please select a vacation type!' },
              ]}
            >
              <Select className="select-field">
                <Option value="solo">Solo</Option>
                <Option value="couple">Couple</Option>
                <Option value="family">Family</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="num_children"
              label="Number of Children"
              className="form-item"
              rules={[
                {
                  required: true,
                  message: 'Please input the number of children!',
                },
              ]}
            >
              <Input
                type="number"
                placeholder="0 for solo/couple"
                className="input-field"
              />
            </Form.Item>
            <Form.Item
              name="num_days"
              label="Number of Days"
              className="form-item"
              rules={[
                { required: true, message: 'Please input the number of days!' },
              ]}
            >
              <Input
                type="number"
                placeholder="E.g., 7"
                className="input-field"
              />
            </Form.Item>
            <Form.Item
              name="city_name"
              label="City Name"
              className="form-item"
              rules={[
                { required: true, message: 'Please select the city name!' },
              ]}
            >
              <Select
                showSearch
                placeholder="Select a city"
                className="select-field"
              >
                {cities.map((city) => (
                  <Option key={city} value={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
              >
                Calculate Cost
              </Button>
            </Form.Item>
          </Form>
          {cost && (
            <p>
              <strong>Estimated Cost:</strong> ${cost}
            </p>
          )}
        </Card>

        <Card title="Fetch City Info" className="card">
          <Form onFinish={handleCityInfoFetch}>
            <Form.Item
              name="city_name"
              label="City Name"
              className="form-item"
              rules={[
                { required: true, message: 'Please select the city name!' },
              ]}
            >
              <Select
                showSearch
                placeholder="Select a city"
                className="select-field"
              >
                {cities.map((city) => (
                  <Option key={city} value={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="vacation_type"
              label="Vacation Type"
              className="form-item"
              rules={[
                { required: true, message: 'Please select a vacation type!' },
              ]}
            >
              <Select className="select-field">
                <Option value="solo">Solo</Option>
                <Option value="couple">Couple</Option>
                <Option value="family">Family</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
              >
                Fetch City Info
              </Button>
            </Form.Item>
          </Form>
          {cityInfo && (
            <div className="city-info-container">
              <h2>City Information</h2>
              <div className="city-info">
                <p>
                  <strong>City:</strong> {cityInfo.city}
                </p>
                <p>
                  <strong>Country:</strong> {cityInfo.country}
                </p>

                <div className="hotels">
                  <h3>Hotels</h3>
                  {cityInfo.hotels && cityInfo.hotels.length > 0 && (
                    <ul>
                      {cityInfo.hotels.map((hotel, index) => (
                        <li key={index}>
                          <strong>Couple Hotel:</strong> {hotel.couple_hotel}{' '}
                          <br />
                          <strong>Family Hotel:</strong> {hotel.family_hotel}{' '}
                          <br />
                          <strong>Solo Hotel:</strong> {hotel.solo_hotel}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="places-to-visit">
                  <h3>Places to Visit</h3>
                  {cityInfo.places_to_visit &&
                    cityInfo.places_to_visit.length > 0 && (
                      <ul>
                        {cityInfo.places_to_visit.map((place, index) => (
                          <li key={index}>
                            <strong>Adventure Place:</strong>{' '}
                            {place.Adventure_place} <br />
                            <strong>Cultural Place:</strong>{' '}
                            {place.Cultural_place} <br />
                            <strong>Extreme Place:</strong>{' '}
                            {place.Extreme_place} <br />
                            <strong>Historical Place:</strong>{' '}
                            {place.Historical_place} <br />
                            <strong>Relax Place:</strong> {place.Relax_place}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

                <div className="restaurants">
                  <h3>Restaurants</h3>
                  {cityInfo.restaurants && cityInfo.restaurants.length > 0 && (
                    <ul>
                      {cityInfo.restaurants.map((restaurant, index) => (
                        <li key={index}>
                          <strong>Couple Restaurant:</strong>{' '}
                          {restaurant.couple_rest} <br />
                          <strong>Family Restaurant:</strong>{' '}
                          {restaurant.fam_rest} <br />
                          <strong>Solo Restaurant:</strong>{' '}
                          {restaurant.solo_rest}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </Content>

      <Footer className="footer">
        &copy; 2024 Vacation Recommendations. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default App;
