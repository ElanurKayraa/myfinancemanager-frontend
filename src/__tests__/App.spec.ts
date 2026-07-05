import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('zeigt beim Start das Anmelde-Formular', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Anmelden')
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('wechselt zur Registrierung', async () => {
    const wrapper = mount(App)
    await wrapper.find('.auth-switch a').trigger('click')
    expect(wrapper.text()).toContain('Registrieren')
  })
})
