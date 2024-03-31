const formater = {
    formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };

        const formattedDate = new Date(date);
        const day = formattedDate.getDate().toString().padStart(2, '0');
        const month = formattedDate.toLocaleString('en-US', { month: 'long' });
        const year = formattedDate.getFullYear();
        const hour = formattedDate.getHours().toString().padStart(2, '0');
        const minute = formattedDate.getMinutes().toString().padStart(2, '0');
        const second = formattedDate.getSeconds().toString().padStart(2, '0');

        return `${day} ${month} ${year} ${hour}:${minute}:${second}`;
    },
    convertIndexToDayName(index) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        if (index >= 0 && index < days.length) {
            return days[index];
        } else {
            return "Indeks hari tidak valid";
        }
    }
}

module.exports = {
    formater
}