/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { floor, random } from 'lodash';
import axios from 'axios';
import { createCanvas } from 'canvas';

/*
dotenv.config: loading our environment variables
avatarColor: method to generate avatar colors randomly
floor(random(0.9): randomly select colors from the list and return it
*/


dotenv.config({});

function avatarColor(): string {
  const colors: string[] = [
    '#f44336',
    '#e91e63',
    '#2196f3',
    '#9c27b0',
    '#3f51b5',
    '#00bcd4',
    '#4caf50',
    '#ff9800',
    '#8bc34a',
    '#009688',
    '#03a9f4',
    '#cddc39',
    '#2962ff',
    '#448aff',
    '#84ffff',
    '#00e676',
    '#43a047',
    '#d32f2f',
    '#ff1744',
    '#ad1457',
    '#6a1b9a',
    '#1a237e',
    '#1de9b6',
    '#d84315',
  ];
  return colors[floor(random(0.9) * colors.length)];
}

/*
generateAvatar: this method is used to generate avatar which can be uploaded to our cloudinary as avatar image
*/
function generateAvatar(
  text: string,
  backgroundColor: string,
  foregroundColor = 'white'
) {
  const canvas = createCanvas(200, 200);
  const context = canvas.getContext('2d');

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'normal 80px sans-serif';
  context.fillStyle = foregroundColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
}

/*
seedUserData: this generates fake users for us
count: number of users to create
(i = 0; i < count; i++): loop to generate users according to the count
username.charAt(0): gets the first character in the username
body: props of the fake user to create
axios.post: sending a post request to our signup endpoint
env.API_URL: our backend url defined in the .env file
seedUserData(10): generates 10 users
faker.word.adjective, [8]: lenght of username we want
*/
async function seedUserData(count: number): Promise<void> {
  let i = 0;
  try {
    for (i = 0; i < count; i++) {
      const username: string = faker.unique(faker.word.adjective, [8]);
      const color = avatarColor();
      const avatar = generateAvatar(username.charAt(0).toUpperCase(), color);

      const body = {
        username,
        email: faker.internet.email(),
        password: 'qwerty',
        avatarColor: color,
        avatarImage: avatar
      };
      console.log(`***ADDING USER TO DATABASE*** - ${i + 1} of ${count} - ${username}`);
      await axios.post(`${process.env.API_URL}/signup`, body);
    }
  } catch (error: any) {
    console.log(error?.response?.data);
  }
}

seedUserData(10);
