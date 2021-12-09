'use strict';
const mongoose = require("mongoose");
mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true});

module.exports = (app) => {
  const bookSchema = new mongoose.Schema({
    title: {type: String, required: true, trim: true},
    comments: {type: [String], default: []},
    commentcount: {type: Number, default: 0}
  });

  const Book = mongoose.model("Book", bookSchema);

  app.route('/api/books')
    .get((req, res) => {
      Book.find((err, docs) => {
        if(err) {
          return err;
        } else {
          console.log("GET: All books.");
          res.json(docs);
        }
      });
    })

    .post((req, res) => {
      const title = req.body.title;
      if(!title) {
        console.log("POST: Missing title.");
        res.send("missing required field title");
      } else {
        const newBook = new Book({
          title: title
        });
        newBook.save((err, data) => {
          if(err) {
            return err;
          } else {
            console.log("POST: Book added - " + title + ".");
            res.json(data);
          };
        });
      }
    })

    .delete((req, res) => {
      Book.find().deleteMany((err, docs) => {
        if(err) {
          return err;
        } else {
          console.log("DELETE ALL: Successful.");
          res.send("complete delete successful");
        }
      });
    });

  app.route('/api/books/:id')
    .get((req, res) => {
      const bookid = req.params.id;
      Book.findById(bookid, (err, docs) => {
        if(!docs) {
          console.log("GET: Wrong id.");
          res.send("no book exists");
        } else {
          console.log("GET: " + bookid + " (title: " + docs.title + ").");
          res.json(docs);
        }
      });
    })

    .post((req, res) => {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if(!comment) {
        console.log("UPDATE: Missing comment.");;
        res.send("missing required field comment");
        return;
      };
      Book.findById(bookid, (err, docs) => {
        if(!docs) {
          console.log("UPDATE: Invalid id.");;
          res.send("no book exists");
        } else {
          docs.comments.push(comment);
          docs.commentcount++;
          docs.save((err, data) => {
            if(err) {
              console.log("UPDATE: Failed.");
              return;
            } else {
              console.log("UPDATE: Successful (title: " + data.title + ").");
              res.json(data);
            };
          });
        };
      });
    })

    .delete((req, res) => {
      const bookid = req.params.id;
      Book.findOneAndDelete({"_id": bookid}, (err, docs) => {
        if(!docs) {
          console.log("DELETE: Invalid id.");
          res.send("no book exists");
        } else {
          console.log("DELETE: Successful (title: " + docs.title + ").");
          res.send("delete successful");
        };
      });
    });
};
