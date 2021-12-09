const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('Routing tests', () => {
    suite('POST /api/books with title => create book object/expect book object', () => {
      // #1
      test('Test POST /api/books with title', (done) => {
        chai
        .request(server)
        .post("/api/books")
        .send({
          title: "Test Book"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isObject(res.body);
          assert.isString(res.body._id);
          assert.equal(res.body.title, "Test Book");
          assert.deepEqual(res.body.comments, []);
          assert.equal(res.body.commentcount, 0);
          assert.equal(res.body.__v, 0);
          done();
        });
      });

      // #2
      test('Test POST /api/books with no title given', (done) => {
        chai
        .request(server)
        .post("/api/books")
        .send({
          title: null
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "text/html");
          assert.equal(res.text, "missing required field title");
          done();
        });
      });
    });

    suite('GET /api/books => array of books', () => {
      // #3
      test('Test GET /api/books', (done) => {
        chai
        .request(server)
        .get("/api/books")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isArray(res.body);
          assert.isString(res.body[0]._id);
          assert.equal(res.body[0].title, "Test Book");
          assert.deepEqual(res.body[0].comments, []);
          assert.equal(res.body[0].commentcount, 0);
          assert.equal(res.body[0].__v, 0);
          done();
        });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', () => {
      // #4
      test('Test GET /api/books/[id] with id not in db', (done) => {
        chai
        .request(server)
        .get("/api/books/aaa")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "text/html");
          assert.equal(res.text, "no book exists");
          done();
        });
      });

      // #5
      test('Test GET /api/books/[id] with valid id in db', (done) => {
        chai
        .request(server)
        .post("/api/books")
        .send({
          title: "Test Book 2"
        })
        .end((err, res) => {
          const newId = res.body._id;
          chai
            .request(server)
            .get("/api/books/" + newId)
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.type, "application/json");
              assert.isObject(res.body);
              assert.equal(res.body._id, newId);
              assert.equal(res.body.title, "Test Book 2");
              assert.deepEqual(res.body.comments, []);
              assert.equal(res.body.commentcount, 0);
              assert.equal(res.body.__v, 0);
            });
          done();
        });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', () => {
      // #6
      test('Test POST /api/books/[id] with comment', (done) => {
        chai
        .request(server)
        .post("/api/books/")
        .send({
          title: "Test Book 3"
        })
        .end((err, res) => {
          const newId = res.body._id;
          chai
            .request(server)
            .post("/api/books/" + newId)
            .send({
              comment: "Comment 1"
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.type, "application/json");
              assert.isObject(res.body);
              assert.equal(res.body._id, newId);
              assert.equal(res.body.title, "Test Book 3");
              assert.deepEqual(res.body.comments, ["Comment 1"]);
              assert.equal(res.body.commentcount, 1);
              assert.equal(res.body.__v, 1);
            });
          done();
        });
      });

      // #7
      test('Test POST /api/books/[id] without comment field', (done) => {
        chai
        .request(server)
        .post("/api/books/")
        .send({
          title: "Test Book 4"
        })
        .end((err, res) => {
          const newId = res.body._id;
          chai
            .request(server)
            .post("/api/books/" + newId)
            .send({
              comment: null
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.type, "text/html");
              assert.equal(res.text, "missing required field comment");
            });
          done();
        });
      });

      // #8
      test('Test POST /api/books/[id] with comment, id not in db', (done) => {
        chai
          .request(server)
          .post("/api/books/aaa")
          .send({
            comment: "Comment 2"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, "text/html");
            assert.equal(res.text, "no book exists");
          });
        done();
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', () => {
      // #9
      test('Test DELETE /api/books/[id] with valid id in db', (done) => {
        chai
        .request(server)
        .post("/api/books/")
        .send({
          title: "Test Book 5"
        })
        .end((err, res) => {
          const newId = res.body._id;
          chai
            .request(server)
            .delete("/api/books/" + newId)
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.type, "text/html");
              assert.equal(res.text, "delete successful");
            });
          done();
        });
      });

      // #10
      test('Test DELETE /api/books/[id] with id not in db', (done) => {
        chai
        .request(server)
        .delete("/api/books/aaa")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "text/html");
          assert.equal(res.text, "no book exists");
          done();
        });
      });
    });
  });
});
