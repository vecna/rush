const request = require('supertest');
const Koa = require('koa');
const router = require('../../../src/api/routes/1');

const app = new Koa();
app.use(router.routes()).use(router.allowedMethods());

describe('API Routes', () => {
  test('GET /1', async () => {
    const response = await request(app.callback()).get('/1');
    expect(response.status).toBe(200);
    expect(response.text).toBe('API set 1 contains endpoints that return the original content with least modification as possible. Please che /swagger to see all the documentation. The original are meant to be processed by other consumers, and via API set 2 the elaboration can be saved.');
  });

  test('GET /1/content', async () => {
    const response = await request(app.callback()).get('/1/content');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  }, 60000); // this is very long!

  test('GET /1/stats', async () => {
    const response = await request(app.callback()).get('/1/stats');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_files');
    expect(response.body).toHaveProperty('total_size');
    expect(response.body).toHaveProperty('files_with_size');
  }, 27000);

  test('GET /1/content/:file_number', async () => {
    // random_file_number is between 0 and 50
    const random_file_number = Math.floor(Math.random() * 50);
    const response = await request(app.callback()).get(`/1/content/${random_file_number}`);
    if (response.status === 200) {
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('requested_file_number');
      expect(response.body).toHaveProperty('posts');
    } else {
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    }
  }, 60000);
});
