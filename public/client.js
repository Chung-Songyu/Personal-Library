$(document).ready(() => {
  $('#newBook').click(() => {
    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: (data) => {
      }
    });
  });

  let items = [];
  let itemsRaw = [];
  $.getJSON('/api/books', (data) => {
    itemsRaw = data;
    $.each(data, (i, val) => {
      items.push('<li class="bookItem '+val._id+'" id="'+i+'">'+val.title+' - '+val.commentcount+' comments</li>');
      // .each() will rerun when (i!==14) returns true
      return (i!==14);
    });
    if(items.length>=15) {
      items.push('<p>... and '+(data.length - 15)+' more!</p>');
    }
    $('<ul/>', {html: items.join('')}).appendTo('#display');
  });

  $('#display').on('click', 'li.bookItem', function() {
    let comments = [];
    $("#detailTitle").html('<b>'+itemsRaw[this.id].title+'</b> <br/><span class="bookItemId">id: '+itemsRaw[this.id]._id+'</span>');
    $.getJSON('/api/books/'+itemsRaw[this.id]._id, (data) => {
      let form = [];
      $.each(data.comments, (i, val) => {
        comments.push('<li>'+val+'</li>');
      });
      form.push('<form id="newCommentForm"><input type="text" id="newComment" name="comment" placeholder="New Comment"></form>');
      form.push('<button class="addComment" id="'+data._id+'">Add Comment</button>');
      form.push('<button class="deleteBook" id="'+data._id+'">Delete Book</button>');
      $('#detailComments').html(comments.join(''));
      $('#detailForms').html(form.join(''));
    });
  });

  $('#bookDetail').on('click', 'button.addComment', function() {
    const newComment = $('#newComment').val();
    let oldComments = $('#detailComments').html();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: (data) => {
        // update comment list in info column without putting in a server request
        oldComments += "<li>"+newComment+"</li>" ;
        $('#detailComments').html(oldComments);
        $('#newComment').val("");

        // update comment counter in list column without putting in a server request
        let oldHtml = $('.'+this.id).html();
        const regex = /\s-\s\d+\scomments/g;
        const oldCounter = oldHtml.match(regex)[0]; // returns " - x comments"

        const regex2 = /\d+/g;
        const oldCounter2 = oldCounter.match(regex2)[0];
        const updatedCounter = String(Number(oldCounter2) + 1);

        const updatedRegex = this.title+" - "+updatedCounter+" comments";
        const oldCounterRegex = this.title+"\\s-\\s"+oldCounter2+"\\scomments";
        const oldCounterRegex2 = new RegExp(oldCounterRegex, "g");
        oldHtml = oldHtml.replace(oldCounterRegex2, updatedRegex);

        $('.'+this.id).html(oldHtml);
      }
    });
  });

  $('#bookDetail').on('click', 'button.deleteBook', function() {
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: (data) => {
        window.location.reload(true);
      }
    });
  });

  $('#deleteAllBooks').click(() => {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      dataType: 'json',
      success: (data) => {
      }
    });
    window.location.reload(true);
  });
});
