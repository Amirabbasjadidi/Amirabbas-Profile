document.addEventListener('DOMContentLoaded', function() {
    var options = {
        strings: [
            "Backend Developer🛠️",
            "Python Developer🐍",
            "JS Developer✨",
            "Telegram Bot Developer🚀👨‍💻",
            "GNU/Linux Enthusiast🐧",
            "FOSS Lover🔥",
            "Open Source Contributor🌐",
            "AI/ML Enthusiast🤖",
            "Flutter Enjoyer🦄",
            "Cinephile🎬",
            "Counter Strike Player⌨️🖱️"
        ],
        typeSpeed: 50,
        backSpeed: 50,
        backDelay: 2000,
        loop: true
    };

    var typed = new Typed("#typed-text", options);

    const icons = document.querySelectorAll('.icon-link');

    icons.forEach(icon => {
        icon.addEventListener('mouseover', function() {
            this.querySelector('img').style.transform = 'scale(1.2)';
        });

        icon.addEventListener('mouseout', function() {
            this.querySelector('img').style.transform = 'scale(1)';
        });

        icon.addEventListener('mousedown', function() {
            this.querySelector('img').style.transform = 'scale(1.1)';
        });

        icon.addEventListener('mouseup', function() {
            this.querySelector('img').style.transform = 'scale(1.2)';
        });
    });

    const discordLink = document.getElementById('discord-link');
    const customDialog = document.getElementById('my-dialog');
    const dialogText = document.getElementById('dialog-text');
    const dialogOkButton = document.getElementById('dialog-ok-button');

    discordLink.addEventListener('click', function(event) {
        event.preventDefault();
        const discordId = 'amirabbas_jadidi';
        navigator.clipboard.writeText(discordId).then(function() {
            showDialog('Discord ID copied to clipboard!<br>Send a message to me :)');
        }, function() {
            showDialog('Failed to copy Discord ID. :(<br>Try again');
        });
    });

    function showDialog(message) {
        dialogText.innerHTML = message;
        customDialog.classList.add('show');
    }

    dialogOkButton.addEventListener('click', function() {
        customDialog.classList.remove('show');
    });
});

