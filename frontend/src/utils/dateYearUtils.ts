
// Get year and month from URL params, default to current date if not provided
export function getInitialYearMonth() {
    const params = new URLSearchParams(window.location.search);
    const currentDate = new Date();
    const yearParam = params.get("year");
    const monthParam = params.get("month");

    return {
        year: yearParam ? parseInt(yearParam) : currentDate.getFullYear(),
        month: monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1,
    };
};