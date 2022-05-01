import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types, disconnect } from 'mongoose';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { CreateProductDto } from '../src/product/dto/create-product.dto';
import { PRODUCT_NOT_FOUND_ERROR } from '../src/product/product.constants';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { REVIEW_NOT_FOUND } from '../src/review/review.constants';
import { ReviewModel } from '../src/review/review.model';
import { ProductModel } from 'src/product/product.model';

const testReviewDto: CreateReviewDto = {
	name: 'Тест',
	title: 'Заголовок',
	description: 'Описание тестовое',
	rating: 5,
	productId: ''
};

const testDto: CreateProductDto = {
    image: "1.png",
    title: "Мой продукт",
    price: 100,
    oldPrice: 120,
    credit: 10,
    description: "Описание продукта",
    advantages: "Преимущества продукта",
    disAdvantages: "Недостатки продукта",
    categories: ["Product"],
    tags: ["тег1"],
    characteristics: [{
        name: "Характеристика 1",
        value: "1"
    },{
        name: "Характеристика 2",
        value: "2"
    }
    ]
};

const loginDto: AuthDto = {
	login: "222@a.ru",
	password: "1"
}

describe('ProductController (e2e)', () => {
  let app: INestApplication;
	let createdProductId: string;
	let token: string;
	let createdReviewId: string

  beforeEach(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleFixture.createNestApplication();
	await app.init();


	const { body } = await request(app.getHttpServer())
			.post('/auth/login')
			.send(loginDto);
	token = body.acces_token;
  });

  it('/product/create (POST) - success', async () => {
	return request(app.getHttpServer())
		.post('/product/create')
		.set('Authorization', 'Bearer ' + token)
		.send(testDto)
		.expect(201)
		.then(({body}: request.Response) => {
			createdProductId = body._id;
			expect(createdProductId).toBeDefined();
		});
  });

	it('/product/create (POST) - validation fail', async () => {
		return request(app.getHttpServer())
			.post('/product/create')
			.set('Authorization', 'Bearer ' + token)
			.send({...testDto, title: 10, price: 'not'})
			.expect(400)
		});

	it('/review/create (POST) - success', async () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.send({...testReviewDto, productId: createdProductId})
			.expect(201)
			.then(({body}: request.Response) => {
				createdReviewId = body._id;
				expect(createdReviewId).toBeDefined();
			});
		});

	it('/review/create (POST) - validation fail', async () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.send({...testReviewDto, rating: 10})
			.expect(400)
		});

	it('/review/byProduct/:productId (GET) - success', () => {
		return request(app.getHttpServer())
			.get('/review/byProduct/' + createdProductId)
			.expect(200)
			.then(({body}: request.Response) => {
				expect(body.length).toBe(1);
			});
	});

	it('/review/byProduct/:productId (GET) - fail', () => {
		return request(app.getHttpServer())
			.get('/review/byProduct/' + new Types.ObjectId().toHexString())
			.expect(200)
			.then(({body}: request.Response) => {
				expect(body.length).toBe(0);
			});
	});

	it('/product/:productId (GET) - success', () => {
		return request(app.getHttpServer())
			.get('/product/' + createdProductId)
			.set('Authorization', 'Bearer ' + token)
			.expect(200)
	});

	it('/product/:productId (GET) - fail', () => {
		return request(app.getHttpServer())
			.get('/product/' + new Types.ObjectId().toHexString())
			.set('Authorization', 'Bearer ' + token)
			.expect(404, {
				statusCode: 404,
				message: PRODUCT_NOT_FOUND_ERROR,
				error: 'Not Found'
			})
	});

	it('/product/:id (PATCH) - success', () => {
		return request(app.getHttpServer())
			.patch('/product/' + createdProductId)
			.set('Authorization', 'Bearer ' + token)
			.send({...testDto, title: 'Новое название продукта'})
			.expect(200)
			.then(({body}: request.Response) => {
				expect(body.title).toBe('Новое название продукта');
			});

	});

	it('/product/:id (PATCH) - fail', () => {
		return request(app.getHttpServer())
			.patch('/product/' + new Types.ObjectId().toHexString())
			.set('Authorization', 'Bearer ' + token)
			.send({...testDto, title: 'Новое название продукта'})
			.expect(404, {
				statusCode: 404,
				message: PRODUCT_NOT_FOUND_ERROR,
				error: 'Not Found'
			})
	});

	it('/product/find (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/product/find')
			.set('Authorization', 'Bearer ' + token)
			.send({category: testDto.categories[0], limit: 3})
			.expect(200)
	});

	it('/product/:id (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete('/product/' + createdProductId)
			.set('Authorization', 'Bearer ' + token)
			.expect(200)
	});

	it('/product/:id (DELETE) - fail', () => {
		return request(app.getHttpServer())
			.delete('/product/' + new Types.ObjectId().toHexString())
			.set('Authorization', 'Bearer ' + token)
			.expect(404, {
				statusCode: 404,
				message: PRODUCT_NOT_FOUND_ERROR,
				error: 'Not Found'
			})
	});

	it('/review/:id (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete('/review/' + createdReviewId)
			.set('Authorization', 'Bearer ' + token)
			.expect(200)
	});

	it('/review/:id (DELETE) - fail', () => {
		return request(app.getHttpServer())
			.delete('/review/' + new Types.ObjectId().toHexString())
			.set('Authorization', 'Bearer ' + token)
			.expect(404, {
				statusCode: 404,
				message: REVIEW_NOT_FOUND,
			})
	});

	afterAll(() => {
		disconnect();
	});
});
