import * as authApi from '../api/auth.js';
import * as storesApi from '../api/stores.js';
import * as usersApi from '../api/users.js';

export function settingsComponent() {
  return {
    password: {
      current: '',
      new: '',
      confirm: ''
    },
    passwordError: '',
    passwordSuccess: '',
    stores: [],
    newStore: { name: '' },
    users: [],
    newUser: { username: '', password: '', role: 'user' },
    loading: false,
    submitting: false,

    async loadStores() {
      this.loading = true;
      try {
        const data = await storesApi.loadStores();
        this.stores = data;
      } catch (error) {
        console.error('加载店铺列表失败:', error);
      } finally {
        this.loading = false;
      }
    },

    async addStore() {
      if (!this.newStore.name) {
        alert('请填写店铺名称');
        return;
      }

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const response = await storesApi.addStore(this.newStore.name);
        if (response.ok) {
          this.newStore.name = '';
          await this.loadStores();
        } else {
          alert('添加失败');
        }
      } catch (error) {
        console.error('添加店铺失败:', error);
        alert('添加失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    async deleteStore(id) {
      if (id === 1) {
        alert('默认店铺不能删除');
        return;
      }
      if (!confirm('确定要删除这个店铺吗？')) return;

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const data = await storesApi.deleteStore(id);
        if (data.error) {
          alert(data.error);
        } else {
          await this.loadStores();
        }
      } catch (error) {
        console.error('删除店铺失败:', error);
        alert('删除失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    async loadUsers() {
      this.loading = true;
      try {
        const data = await usersApi.loadUsers();
        this.users = data;
      } catch (error) {
        console.error('加载用户列表失败:', error);
        this.users = [];
      } finally {
        this.loading = false;
      }
    },

    async addUser() {
      if (!this.newUser.username || !this.newUser.password) {
        alert('用户名和密码不能为空');
        return;
      }

      if (this.newUser.password.length < 3) {
        alert('密码长度至少3个字符');
        return;
      }

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const response = await usersApi.addUser(
          this.newUser.username,
          this.newUser.password,
          this.newUser.role
        );

        if (response.ok) {
          this.newUser = { username: '', password: '', role: 'user' };
          await this.loadUsers();
          alert('用户添加成功！');
        } else {
          const data = await response.json();
          alert(data.error || '添加失败');
        }
      } catch (error) {
        console.error('添加用户失败:', error);
        alert('添加失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    async deleteUser(id) {
      if (!confirm('确定要删除这个用户吗？')) return;

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const response = await usersApi.deleteUser(id);
        if (response.ok) {
          await this.loadUsers();
          alert('用户删除成功！');
        } else {
          const data = await response.json();
          alert(data.error || '删除失败');
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    async changePassword() {
      this.passwordError = '';
      this.passwordSuccess = '';

      if (this.password.new !== this.password.confirm) {
        this.passwordError = '两次输入的密码不一致';
        return;
      }

      if (this.password.new.length < 3) {
        this.passwordError = '新密码长度至少3个字符';
        return;
      }

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const data = await authApi.changePassword(
          this.password.current,
          this.password.new
        );

        if (data.message === '密码修改成功') {
          this.passwordSuccess = '密码修改成功';
          this.password = { current: '', new: '', confirm: '' };
        } else {
          this.passwordError = data.error || '修改失败';
        }
      } catch (error) {
        console.error('修改密码失败:', error);
        this.passwordError = '修改失败，请稍后重试';
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    canManageUsers() {
      return this.currentUser && this.currentUser.role === 'admin';
    }
  };
}
