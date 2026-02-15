function showForm(form) {
    document.getElementById('form-user').style.display = (form === 'user') ? 'block' : 'none';
    document.getElementById('form-agent').style.display = (form === 'agent') ? 'block' : 'none';
    document.getElementById('form-location').style.display = (form === 'location') ? 'block' : 'none';
    var buttons = document.getElementsByClassName('tab-button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('active');
        }
        if (form === 'user') buttons[0].classList.add('active');
        if (form === 'agent') buttons[1].classList.add('active');
        if (form === 'location') buttons[2].classList.add('active');
    }
 