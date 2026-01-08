import * as usersApi from '../api/users.js';

export function consumptionComponent() {
  return {
    consumptionData: [],
    loading: false,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    years: [],
    months: [],

    init() {
      this.initSelectors();
    },

    initSelectors() {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      this.years = [];
      for (let i = currentYear - 5; i <= currentYear; i++) {
        this.years.push({ value: i, label: i + '年' });
      }
      this.year = currentYear;

      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push({ value: i, label: i + '月' });
      }
      this.month = currentMonth;
    },

    async load(storeId) {
      this.loading = true;
      try {
        const data = await usersApi.loadConsumption(this.year, this.month, storeId);
        this.consumptionData = data;
      } catch (error) {
        console.error('加载消耗统计失败:', error);
      } finally {
        this.loading = false;
      }
    }
  };
}
